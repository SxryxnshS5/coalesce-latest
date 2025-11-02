import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts'
import type { AnalysisBundle, TraitScores } from '../lib/types'

type Props = {
  data: AnalysisBundle
  showHuman?: boolean
  showAI?: boolean
  showCollab?: boolean
}

const toData = (scores?: TraitScores) =>
  scores
    ? [
        { trait: 'empathy', value: scores.empathy },
        { trait: 'confidence', value: scores.confidence },
        { trait: 'rationality', value: scores.rationality },
        { trait: 'warmth', value: scores.warmth },
      ]
    : undefined

export default function RadarTraits({
  data,
  showHuman = true,
  showAI = true,
  showCollab = true,
}: Props) {
  // Build rows with per-series values for Recharts
  const rows = ['empathy', 'confidence', 'rationality', 'warmth'].map(
    (trait) => ({
      trait,
      human: (data.human as any)?.[trait] ?? 0,
      ai: (data.ai as any)?.[trait] ?? 0,
      collab: (data.collab as any)?.[trait] ?? 0,
    })
  )
  return (
    <ResponsiveContainer width='100%' height={360}>
      <RadarChart
        outerRadius={120}
        data={rows}
        margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
      >
        <PolarGrid stroke='rgba(255,255,255,0.25)' />
        <PolarAngleAxis
          dataKey='trait'
          tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={45}
          domain={[0, 1]}
          tick={false}
          axisLine={false}
        />
        {showHuman && (
          <Radar
            name='Human'
            dataKey='human'
            stroke='#ec4899'
            fill='#ec4899'
            fillOpacity={0.2}
          />
        )}
        {showAI && (
          <Radar
            name='AI'
            dataKey='ai'
            stroke='#22d3ee'
            fill='#22d3ee'
            fillOpacity={0.2}
          />
        )}
        {showCollab && (
          <Radar
            name='Collab'
            dataKey='collab'
            stroke='#a78bfa'
            fill='#a78bfa'
            fillOpacity={0.2}
          />
        )}
        <Legend />
        <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 100)}%`} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
