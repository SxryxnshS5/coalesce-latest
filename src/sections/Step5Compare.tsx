import {
  Button,
  Heading,
  HStack,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import LayoutCard from '../components/LayoutCard'
import RadarTraits from '../components/RadarTraits'
import { useAppStore } from '../store/app'
import { analyzeTraits, generateInsight } from '../lib/gemini'
import { useState } from 'react'

export default function Step5Compare() {
  const toast = useToast()
  const {
    humanAnswer,
    aiAnswer,
    collabText,
    traits,
    setTraits,
    insight,
    setInsight,
    setStep,
    reset,
    loading,
    setLoading,
  } = useAppStore()
  const [copying, setCopying] = useState(false)

  const ensureAnalysis = async () => {
    try {
      setLoading({ analyze: true })
      const bundle = await analyzeTraits({
        human: humanAnswer,
        ai: aiAnswer,
        collab: collabText,
      })
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

  const handleInsight = async () => {
    try {
      setLoading({ insight: true })
      let acc = ''
      setInsight(acc)
      const text = await generateInsight(humanAnswer, aiAnswer, collabText, {
        onDelta: (chunk) => {
          acc += chunk
          setInsight(acc)
        },
      })
      setInsight(text)
    } catch (e: any) {
      toast({
        status: 'error',
        title: 'Insight failed',
        description: e?.message || String(e),
      })
    } finally {
      setLoading({ insight: false })
    }
  }

  const handleCopy = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(
        `Coalesce — Final Insight\n\n${
          insight || ''
        }\n\nCollaborative response:\n${collabText}`
      )
      toast({ status: 'success', title: 'Copied to clipboard' })
    } catch (e: any) {
      toast({
        status: 'error',
        title: 'Copy failed',
        description: e?.message || String(e),
      })
    } finally {
      setCopying(false)
    }
  }

  return (
    <LayoutCard>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Step 5 — Final comparison & insight</Heading>
        <Text color='whiteAlpha.800'>
          See all three voices together and generate a succinct takeaway.
        </Text>
        <RadarTraits data={traits} />
        <HStack flexDirection={{ base: 'column', sm: 'row' }} gap={2}>
          <Button
            onClick={ensureAnalysis}
            variant='ghost'
            isLoading={loading.analyze}
            width={{ base: 'full', sm: 'auto' }}
          >
            Re-analyze
          </Button>
          <Button
            colorScheme='gray'
            onClick={handleInsight}
            isLoading={loading.insight}
            width={{ base: 'full', sm: 'auto' }}
          >
            Generate insight
          </Button>
          <Button
            onClick={handleCopy}
            isLoading={copying}
            width={{ base: 'full', sm: 'auto' }}
          >
            Copy insight & response
          </Button>
        </HStack>
        {insight && (
          <VStack align='stretch' spacing={2}>
            <Text fontSize='sm' color='whiteAlpha.700'>
              Insight
            </Text>
            <Textarea
              value={insight}
              readOnly
              rows={12}
              minH={{ base: '180px', md: '240px' }}
              variant='filled'
            />
          </VStack>
        )}
        <HStack
          justify='space-between'
          flexDirection={{ base: 'column', sm: 'row' }}
          gap={2}
        >
          <Button
            onClick={reset}
            variant='ghost'
            width={{ base: 'full', sm: 'auto' }}
          >
            Start over
          </Button>
          <Button
            onClick={() => setStep(4)}
            variant='ghost'
            width={{ base: 'full', sm: 'auto' }}
          >
            Back to collaborate
          </Button>
        </HStack>
      </VStack>
    </LayoutCard>
  )
}
