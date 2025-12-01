import {
  Button,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
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

  useEffect(() => {
    const zeroish = (obj?: {
      empathy: number
      confidence: number
      rationality: number
      warmth: number
    }) =>
      !obj || obj.empathy + obj.confidence + obj.rationality + obj.warmth === 0
    if (
      !traits.human ||
      !traits.ai ||
      zeroish(traits.human) ||
      zeroish(traits.ai)
    ) {
      void run()
    }
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
        <RadarTraits data={traits} showCollab={false} />
        <BarTraits human={traits.human} ai={traits.ai} />
        <HStack
          justify='space-between'
          flexDirection={{ base: 'column', sm: 'row' }}
          gap={2}
        >
          <Button
            variant='ghost'
            onClick={run}
            isLoading={loading.analyze}
            width={{ base: 'full', sm: 'auto' }}
          >
            Re-analyze
          </Button>
          <Button
            colorScheme='gray'
            onClick={() => setStep(4)}
            width={{ base: 'full', sm: 'auto' }}
          >
            Next: Collaborate
          </Button>
        </HStack>
      </VStack>
    </LayoutCard>
  )
}
