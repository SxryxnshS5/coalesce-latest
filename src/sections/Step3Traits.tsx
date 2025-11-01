import { Button, Heading, Text, VStack, useToast } from '@chakra-ui/react'
import LayoutCard from '../components/LayoutCard'
import RadarTraits from '../components/RadarTraits'
import BarTraits from '../components/BarTraits'
import { useAppStore } from '../store/app'
import { analyzeTraits } from '../lib/openai'
import { useEffect } from 'react'

export default function Step3Traits() {
  const toast = useToast()
  const {
    humanAnswer,
    aiAnswer,
    traits,
    setTraits,
    setStep,
    loading,
    setLoading,
  } = useAppStore()

  useEffect(() => {
    const run = async () => {
      if (!humanAnswer || !aiAnswer) return
      try {
        setLoading({ analyze: true })
        const bundle = await analyzeTraits({ human: humanAnswer, ai: aiAnswer })
        setTraits(bundle)
      } catch (e: any) {
        toast({
          status: 'error',
          title: 'Analysis failed',
          description: e?.message || String(e),
        })
      } finally {
        setLoading({ analyze: false })
      }
    }
    if (!traits.human || !traits.ai) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LayoutCard>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Step 3 — Trait analysis</Heading>
        <Text color='whiteAlpha.800'>
          See how tone and reasoning show up across empathy, confidence,
          rationality, and warmth.
        </Text>
        <RadarTraits data={traits} />
        <BarTraits human={traits.human} ai={traits.ai} />
        <Button
          colorScheme='purple'
          onClick={() => setStep(4)}
          alignSelf='flex-end'
        >
          Next: Collaborate
        </Button>
      </VStack>
    </LayoutCard>
  )
}
