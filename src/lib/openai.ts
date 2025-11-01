import { AnalysisBundle, TraitScores, TRAIT_KEYS } from './types'

const API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

function getApiKey(): string {
  const key = (import.meta as any).env?.VITE_OPENAI_API_KEY as
    | string
    | undefined
  if (!key) {
    throw new Error('Missing VITE_OPENAI_API_KEY. Add it to your .env file.')
  }
  return key
}

async function chat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const key = getApiKey()
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${text}`)
  }
  const data = await res.json()
  const content: string | undefined = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('No content returned from OpenAI')
  return content.trim()
}

export async function generateAIAnswer(
  question: string,
  humanAnswer?: string
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
  return chat(messages)
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
  collab: string
): Promise<string> {
  const system =
    'You succinctly explain how tones and reasoning converged between a human and an AI. 120-180 words, actionable, compassionate.'
  const user = `Summarize convergence of tone and reasoning.\nHUMAN:\n"""${human}"""\nAI:\n"""${ai}"""\nCOLLAB:\n"""${collab}"""`
  return chat([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ])
}
