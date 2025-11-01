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

function parseScores(jsonText: string): TraitScores {
  try {
    const obj = JSON.parse(jsonText)
    const scores: TraitScores = {
      empathy: clamp(obj.empathy),
      confidence: clamp(obj.confidence),
      rationality: clamp(obj.rationality),
      warmth: clamp(obj.warmth),
    }
    return scores
  } catch (e) {
    // attempt to extract JSON block
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (match) return parseScores(match[0])
    throw new Error('Failed to parse trait scores JSON')
  }
}

function clamp(n: any): number {
  const x = typeof n === 'number' ? n : Number(n)
  if (!isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
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
    const obj = JSON.parse(content)
    const bundle: AnalysisBundle = {}
    if (obj.human) bundle.human = ensureScores(obj.human)
    if (obj.ai) bundle.ai = ensureScores(obj.ai)
    if (obj.collab) bundle.collab = ensureScores(obj.collab)
    return bundle
  } catch (e) {
    // Fallback: try to parse embedded JSON block
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      const obj = JSON.parse(match[0])
      const bundle: AnalysisBundle = {}
      if (obj.human) bundle.human = ensureScores(obj.human)
      if (obj.ai) bundle.ai = ensureScores(obj.ai)
      if (obj.collab) bundle.collab = ensureScores(obj.collab)
      return bundle
    }
    throw new Error('Failed to parse analysis JSON')
  }
}

function ensureScores(x: any): TraitScores {
  const s: TraitScores = {
    empathy: clamp(x?.empathy),
    confidence: clamp(x?.confidence),
    rationality: clamp(x?.rationality),
    warmth: clamp(x?.warmth),
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
