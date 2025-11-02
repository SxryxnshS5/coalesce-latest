import { AnalysisBundle, TraitScores, TRAIT_KEYS } from './types'

// Gemini REST API
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
// Allow overriding the model via env; fall back to a widely available default
const GEMINI_MODEL =
  ((import.meta as any).env?.VITE_GEMINI_MODEL as string | undefined) ||
  'gemini-2.5-pro'

function getApiKey(): string {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY as
    | string
    | undefined
  if (!key) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to your .env file.')
  }
  return key
}

type Msg = { role: 'system' | 'user' | 'assistant'; content: string }

function toGeminiPayload(messages: Msg[]) {
  // Extract a single system instruction if provided
  const system = messages.find((m) => m.role === 'system')?.content
  // Map chat history to Gemini "contents" format
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const body: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
    },
  }
  if (system) {
    body.systemInstruction = { role: 'system', parts: [{ text: system }] }
  }
  return body
}

async function chat(messages: Array<Msg>): Promise<string> {
  const key = getApiKey()
  const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(toGeminiPayload(messages)),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini error ${res.status}: ${text}`)
  }

  const data = await res.json()
  // Attempt to extract the concatenated text from the first candidate
  const parts = data?.candidates?.[0]?.content?.parts
  const content: string | undefined = Array.isArray(parts)
    ? parts
        .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        .join('')
        .trim()
    : undefined

  if (!content) {
    const block = data?.promptFeedback?.blockReason
    if (block) {
      throw new Error(`Gemini returned no content (blocked: ${String(block)})`)
    }
    throw new Error('No content returned from Gemini')
  }
  return content
}

async function chatStream(
  messages: Array<Msg>,
  opts?: { onDelta?: (chunk: string) => void; signal?: AbortSignal }
): Promise<string> {
  const key = getApiKey()
  // Use SSE for more reliable streaming parsing
  const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:streamGenerateContent?alt=sse`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(toGeminiPayload(messages)),
    signal: opts?.signal,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini stream error ${res.status}: ${text}`)
  }

  if (!res.body) {
    // Fallback: no stream support; do a non-streaming call
    return chat(messages)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let full = ''

  function extractText(obj: any): string {
    // Common shapes across stream events
    const parts = obj?.candidates?.[0]?.content?.parts
    if (Array.isArray(parts)) {
      return parts
        .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        .join('')
    }
    // Some events may include delta objects
    const deltaText = obj?.candidates?.[0]?.delta?.text
    if (typeof deltaText === 'string') return deltaText
    const deltaParts = obj?.candidates?.[0]?.delta?.parts
    if (Array.isArray(deltaParts)) {
      return deltaParts
        .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        .join('')
    }
    // Rare: plain text on root
    if (typeof obj?.text === 'string') return obj.text
    return ''
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let idx: number
    // Process Server-Sent Events (SSE) lines: "event: ..." and "data: ..."
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 1)
      const trimmed = line.trim()
      if (!trimmed) continue
      if (trimmed.startsWith('data:')) {
        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const obj = JSON.parse(payload)
          const chunk = extractText(obj)
          if (chunk) {
            full += chunk
            opts?.onDelta?.(chunk)
          }
        } catch {
          // Ignore non-JSON lines or partials
        }
      }
      // Ignore other SSE fields like "event:" or comments
    }
  }

  // Try to parse any leftover SSE data line
  const last = buffer.trim()
  if (last.startsWith('data:')) {
    const payload = last.slice(5).trim()
    if (payload && payload !== '[DONE]') {
      try {
        const obj = JSON.parse(payload)
        const chunk = extractText(obj)
        if (chunk) {
          full += chunk
          opts?.onDelta?.(chunk)
        }
      } catch {
        // ignore
      }
    }
  }

  const finalText = full.trim()
  if (!finalText) {
    // Last-resort fallback: attempt non-streaming request
    const fallback = await chat(messages)
    if (fallback && fallback.trim()) return fallback.trim()
    throw new Error('No content returned from Gemini stream')
  }
  return finalText
}

export async function generateAIAnswer(
  question: string,
  humanAnswer?: string,
  options?: { onDelta?: (chunk: string) => void; signal?: AbortSignal }
): Promise<string> {
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are a thoughtful, balanced assistant. Provide a concise, reflective answer (150-250 words).',
    },
    {
      role: 'user' as const,
      content:
        `Question: ${question}\n` +
        (humanAnswer
          ? `The human has provided their perspective: """${humanAnswer}""". Offer a distinct but respectful perspective.`
          : 'Provide your perspective.'),
    },
  ]
  return chatStream(messages, {
    onDelta: options?.onDelta,
    signal: options?.signal,
  })
}

export async function continueCollaborativeResponse(
  question: string,
  human: string,
  ai: string,
  collabSoFar: string,
  lastHumanTurn?: string,
  options?: { onDelta?: (chunk: string) => void; signal?: AbortSignal }
): Promise<string> {
  const system =
    'You are collaborating with a human to co-write a single, empathetic and balanced response. Write as the AI collaborator. Output only the next 1–2 sentences. Be specific, acknowledge or build on the human’s latest point, and keep tightly on-topic to the question. Do not repeat prior content, restate the question, or add generic transitions.'
  const user =
    `Question:\n${question}\n\n` +
    `HUMAN perspective (Step 2):\n"""${human}"""\n\n` +
    `AI perspective (Step 2):\n"""${ai}"""\n\n` +
    `Collaborative response so far:\n"""${collabSoFar}"""\n\n` +
    (lastHumanTurn
      ? `Human’s latest addition to the collaborative response (respond to this directly):\n"""${lastHumanTurn}"""\n\n`
      : '') +
    'As the AI, write only the next 1–2 sentences to advance this same response. No preface, no bullet points.'
  return chatStream(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { onDelta: options?.onDelta, signal: options?.signal }
  )
}

function lowerKeys<T extends Record<string, any>>(
  obj: T | undefined
): Record<string, any> | undefined {
  if (!obj || typeof obj !== 'object') return obj
  const out: Record<string, any> = {}
  for (const k of Object.keys(obj)) {
    out[k.toLowerCase()] = (obj as any)[k]
  }
  return out
}

function coerceScore(n: any): number {
  // Accept 0..1 floats or 0..100 percentages; clamp to [0,1]
  const x = typeof n === 'number' ? n : Number(n)
  if (!isFinite(x)) return 0
  const normalized = x > 1 ? x / 100 : x
  return Math.max(0, Math.min(1, normalized))
}

function parseScores(jsonText: string): TraitScores {
  try {
    const raw = JSON.parse(jsonText)
    const obj = lowerKeys(raw) as Record<string, any>
    const scores: TraitScores = {
      empathy: coerceScore(obj?.empathy),
      confidence: coerceScore(obj?.confidence),
      rationality: coerceScore(obj?.rationality),
      warmth: coerceScore(obj?.warmth),
    }
    return scores
  } catch (e) {
    // attempt to extract JSON block
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) return parseScores(match[0])
    throw new Error('Failed to parse trait scores JSON')
  }
}

export async function analyzeSingle(text: string): Promise<TraitScores> {
  const system =
    'You are an analyst. Return ONLY a compact JSON object with keys empathy, confidence, rationality, warmth, each in [0,1]. No commentary.'
  const user = `Analyze the following text for the specified traits. Respond with JSON only.\nText:\n"""${text}"""`
  const content = await chat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ])
  return parseScores(content)
}

export async function analyzeTraits(texts: {
  human?: string
  ai?: string
  collab?: string
}): Promise<AnalysisBundle> {
  const parts: string[] = []
  if (texts.human) parts.push(`HUMAN:\n"""${texts.human}"""`)
  if (texts.ai) parts.push(`AI:\n"""${texts.ai}"""`)
  if (texts.collab) parts.push(`COLLAB:\n"""${texts.collab}"""`)

  const system =
    'You are an analyst. For each provided role (HUMAN, AI, COLLAB), return trait scores in [0,1]. Return ONLY JSON: { human?, ai?, collab? } where each value is { empathy, confidence, rationality, warmth }.'
  const user = `Analyze the following texts and output JSON only.\n${parts.join(
    '\n\n'
  )}`
  const content = await chat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ])

  try {
    const raw = JSON.parse(content)
    const o = lowerKeys(raw) as Record<string, any>
    const bundle: AnalysisBundle = {}
    // Accept HUMAN/AI/COLLAB or human/ai/collab
    if (o.human) bundle.human = ensureScores(o.human)
    if (o.ai) bundle.ai = ensureScores(o.ai)
    if (o.collab) bundle.collab = ensureScores(o.collab)
    // Fallback: map from possible upper-case role keys
    if (!bundle.human && o['human']) bundle.human = ensureScores(o['human'])
    if (!bundle.human && o['hum']) bundle.human = ensureScores(o['hum'])
    return bundle
  } catch (e) {
    // Fallback: try to parse embedded JSON block
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      const raw = JSON.parse(match[0])
      const o = lowerKeys(raw) as Record<string, any>
      const bundle: AnalysisBundle = {}
      if (o.human) bundle.human = ensureScores(o.human)
      if (o.ai) bundle.ai = ensureScores(o.ai)
      if (o.collab) bundle.collab = ensureScores(o.collab)
      return bundle
    }
    throw new Error('Failed to parse analysis JSON')
  }
}

function ensureScores(x: any): TraitScores {
  const o = lowerKeys(x) as Record<string, any>
  const s: TraitScores = {
    empathy: coerceScore(o?.empathy),
    confidence: coerceScore(o?.confidence),
    rationality: coerceScore(o?.rationality),
    warmth: coerceScore(o?.warmth),
  }
  return s
}

export async function generateInsight(
  human: string,
  ai: string,
  collab: string,
  options?: { onDelta?: (chunk: string) => void; signal?: AbortSignal }
): Promise<string> {
  const system =
    'You succinctly explain how tones and reasoning converged between a human and an AI. 120-180 words, actionable, compassionate.'
  const user = `Summarize convergence of tone and reasoning.\nHUMAN:\n"""${human}"""\nAI:\n"""${ai}"""\nCOLLAB:\n"""${collab}"""`
  return chatStream(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { onDelta: options?.onDelta, signal: options?.signal }
  )
}
