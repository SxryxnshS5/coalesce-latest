import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import LayoutCard from '../components/LayoutCard'
import Editor from '../components/Editor'
import RadarTraits from '../components/RadarTraits'
import { useAppStore } from '../store/app'
import { analyzeSingle, generateAIAnswer } from '../lib/openai'
import { useCallback } from 'react'

export default function Step4Collaborate() {
  const toast = useToast()
  const {
    humanAnswer,
    aiAnswer,
    collabText,
    setCollabText,
    traits,
    setTraits,
    setStep,
    loading,
    setLoading,
  } = useAppStore()

  const seed = !collabText
    ? 'Let’s bridge our perspectives into a single, empathetic and balanced response...'
    : collabText

  const handleSuggest = useCallback(async () => {
    try {
      setLoading({ ai: true })
      const suggestion = await generateAIAnswer(
        'Continue the collaborative response, 1-2 sentences.',
        seed
      )
      setCollabText(`${seed}\n\n${suggestion}`)
    } catch (e: any) {
      toast({
        status: 'error',
        title: 'Suggestion failed',
        description: e?.message || String(e),
      })
    } finally {
      setLoading({ ai: false })
    }
  }, [seed, setCollabText, setLoading, toast])

  const handleDebouncedAnalyze = useCallback(
    async (text: string) => {
      try {
        const scores = await analyzeSingle(text)
        setTraits({ ...traits, collab: scores })
      } catch {
        // no-op live errors
      }
    },
    [setTraits, traits]
  )

  return (
    <LayoutCard>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Step 4 — Co-write a bridged response</Heading>
        <Text color='whiteAlpha.800'>
          Take turns refining the shared response. Watch traits update as you
          write.
        </Text>
        <Editor
          label='Collaborative response'
          value={seed}
          onChange={setCollabText}
          onDebouncedChange={handleDebouncedAnalyze}
          rows={12}
          rightAction={{
            label: "AI's response",
            onClick: handleSuggest,
            isLoading: loading.ai,
          }}
        />

        <Divider borderColor='whiteAlpha.300' />
        <Box>
          <Text fontSize='sm' color='whiteAlpha.800' mb={2}>
            Live trait preview
          </Text>
          <RadarTraits data={{ ...traits, collab: traits.collab }} />
        </Box>

        <HStack justify='flex-end'>
          <Button
            colorScheme='purple'
            onClick={() => setStep(5)}
            isDisabled={!seed.trim()}
          >
            Next: Compare & insight
          </Button>
        </HStack>
      </VStack>
    </LayoutCard>
  )
}
