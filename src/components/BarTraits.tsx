import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import type { TraitScores } from '../lib/types'

type Props = {
  human?: TraitScores
  ai?: TraitScores
}

function toRows(h?: TraitScores, a?: TraitScores) {
  return [
    { trait: 'empathy', human: h?.empathy ?? 0, ai: a?.empathy ?? 0 },
    { trait: 'confidence', human: h?.confidence ?? 0, ai: a?.confidence ?? 0 },
    {
      trait: 'rationality',
      human: h?.rationality ?? 0,
      ai: a?.rationality ?? 0,
    },
    { trait: 'warmth', human: h?.warmth ?? 0, ai: a?.warmth ?? 0 },
  ]
}

export default function BarTraits({ human, ai }: Props) {
  const rows = toRows(human, ai)
  return (
    <ResponsiveContainer width='100%' height={320}>
      <BarChart data={rows} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.15)' />
        <XAxis dataKey='trait' tick={{ fill: 'rgba(255,255,255,0.85)' }} />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v: number) => `${Math.round(Number(v) * 100)}%`}
          tick={{ fill: 'rgba(255,255,255,0.85)' }}
        />
        <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 100)}%`} />
        <Legend />
        <Bar
          dataKey='human'
          name='Human'
          fill='#ec4899'
          radius={[6, 6, 0, 0]}
        />
        <Bar dataKey='ai' name='AI' fill='#22d3ee' radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
