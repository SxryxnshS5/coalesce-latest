export type TraitKey = 'empathy' | 'confidence' | 'rationality' | 'warmth'

export interface TraitScores {
  empathy: number
  confidence: number
  rationality: number
  warmth: number
}

export interface AnalysisBundle {
  human?: TraitScores
  ai?: TraitScores
  collab?: TraitScores
}

export const TRAIT_KEYS: TraitKey[] = [
  'empathy',
  'confidence',
  'rationality',
  'warmth',
]

export const RoleColor = {
  human: '#ec4899',
  ai: '#22d3ee',
  collab: '#a78bfa',
} as const
