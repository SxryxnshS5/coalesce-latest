import { create } from 'zustand'
import type { AnalysisBundle } from '../lib/types'

type Loading = {
  ai: boolean
  analyze: boolean
  insight: boolean
}

type AppState = {
  step: number // 1..5
  question: string
  humanAnswer: string
  aiAnswer: string
  collabText: string
  traits: AnalysisBundle
  insight?: string
  loading: Loading
  // actions
  setStep: (n: number) => void
  setQuestion: (q: string) => void
  setHumanAnswer: (t: string) => void
  setAIAnswer: (t: string) => void
  setCollabText: (t: string) => void
  setTraits: (t: AnalysisBundle) => void
  setInsight: (t?: string) => void
  setLoading: (patch: Partial<Loading>) => void
  reset: () => void
}

type Setter = (
  partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)
) => void

export const useAppStore = create<AppState>((set: Setter) => ({
  step: 1,
  question: '',
  humanAnswer: '',
  aiAnswer: '',
  collabText: '',
  traits: {},
  insight: undefined,
  loading: { ai: false, analyze: false, insight: false },
  setStep: (n: number) => set({ step: Math.min(5, Math.max(1, n)) }),
  setQuestion: (q: string) => set({ question: q }),
  setHumanAnswer: (t: string) => set({ humanAnswer: t }),
  setAIAnswer: (t: string) => set({ aiAnswer: t }),
  setCollabText: (t: string) => set({ collabText: t }),
  setTraits: (traits: AnalysisBundle) => set({ traits }),
  setInsight: (insight?: string) => set({ insight }),
  setLoading: (patch: Partial<Loading>) =>
    set((s) => ({ loading: { ...s.loading, ...patch } })),
  reset: () =>
    set({
      step: 1,
      question: '',
      humanAnswer: '',
      aiAnswer: '',
      collabText: '',
      traits: {},
      insight: undefined,
      loading: { ai: false, analyze: false, insight: false },
    }),
}))
