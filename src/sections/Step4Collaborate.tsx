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
import { analyzeSingle, continueCollaborativeResponse } from '../lib/openai'
import { useCallback } from 'react'

export default function Step4Collaborate() {
  const toast = useToast()
  const {
    question,
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

  const placeholder =
    'Let’s bridge our perspectives into a single, empathetic and balanced response...'

  const handleSuggest = useCallback(async () => {
    try {
      setLoading({ ai: true })
      const chunks = (collabText || '')
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean)
      const lastHumanTurn = chunks.length ? chunks[chunks.length - 1] : ''

      // Start a new AI turn and stream into the editor
      let base = collabText ? `${collabText}\n\n` : ''
      let acc = ''
      setCollabText(base)
      const final = await continueCollaborativeResponse(
        question,
        humanAnswer,
        aiAnswer,
        collabText || '',
        lastHumanTurn,
        {
          onDelta: (chunk) => {
            acc += chunk
            setCollabText(base + acc)
          },
        }
      )
      // Ensure final text is set
      setCollabText(base + final)
    } catch (e: any) {
      toast({
        status: 'error',
        title: 'Suggestion failed',
        description: e?.message || String(e),
      })
    } finally {
      setLoading({ ai: false })
    }
  }, [
    question,
    humanAnswer,
    aiAnswer,
    collabText,
    setCollabText,
    setLoading,
    toast,
  ])

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
          write. Press Ctrl+Enter for the AI to take a turn.
        </Text>
        <Editor
          label='Collaborative response'
          value={collabText}
          onChange={setCollabText}
          onDebouncedChange={handleDebouncedAnalyze}
          rows={12}
          placeholder={placeholder}
          rightAction={{
            label: "Trigger AI's answer",
            onClick: handleSuggest,
            isLoading: loading.ai,
            hotkey: 'Ctrl+Enter',
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
            colorScheme='gray'
            onClick={() => setStep(5)}
            isDisabled={!collabText.trim()}
          >
            Next: Compare & insight
          </Button>
        </HStack>
      </VStack>
    </LayoutCard>
  )
}
