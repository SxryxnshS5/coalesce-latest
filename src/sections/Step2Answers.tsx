import {
  Button,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import LayoutCard from '../components/LayoutCard'
import Editor from '../components/Editor'
import { useAppStore } from '../store/app'
import { generateAIAnswer } from '../lib/gemini'
import { useEffect, useRef } from 'react'

export default function Step2Answers() {
  const toast = useToast()
  const {
    question,
    humanAnswer,
    aiAnswer,
    setHumanAnswer,
    setAIAnswer,
    setStep,
    loading,
    setLoading,
  } = useAppStore()

  const handleGenerateAI = async () => {
    try {
      setLoading({ ai: true })
      // Start fresh and stream into the editor
      let acc = ''
      setAIAnswer(acc)
      const text = await generateAIAnswer(question, humanAnswer, {
        onDelta: (chunk) => {
          acc += chunk
          setAIAnswer(acc)
        },
      })
      // Ensure final text is set (in case of any missed chunks)
      setAIAnswer(text)
    } catch (e: any) {
      toast({
        status: 'error',
        title: 'AI generation failed',
        description: e?.message || String(e),
      })
    } finally {
      setLoading({ ai: false })
    }
  }

  // Auto-generate AI answer once the human has written enough (first time only)
  const hasAutoTriggered = useRef(false)
  useEffect(() => {
    const wordCount = (s: string) =>
      s.trim() ? s.trim().split(/\s+/).length : 0
    if (
      !loading.ai &&
      !aiAnswer &&
      wordCount(humanAnswer) >= 0 &&
      question.trim() &&
      !hasAutoTriggered.current
    ) {
      hasAutoTriggered.current = true
      void handleGenerateAI()
    }
  }, [humanAnswer, aiAnswer, question, loading.ai])

  return (
    <LayoutCard>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Step 2 — Write your answers</Heading>
        <Text color='whiteAlpha.800'>
          Share your perspective, then invite the AI to offer its own.
        </Text>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <GridItem>
            <Editor
              label='Human answer'
              value={humanAnswer}
              onChange={setHumanAnswer}
              placeholder='Write thoughtfully (150-250 words)...'
              rows={{ base: 8, md: 12 }}
              autoFocus
            />
          </GridItem>
          <GridItem>
            <Editor
              label='AI answer'
              value={aiAnswer}
              onChange={setAIAnswer}
              placeholder='Click the refresh icon or paste your own...'
              rows={{ base: 8, md: 12 }}
              rightAction={{
                label: 'Generate AI answer',
                onClick: handleGenerateAI,
                isLoading: loading.ai,
              }}
            />
          </GridItem>
        </Grid>
        <VStack align={{ base: 'stretch', sm: 'end' }}>
          <Button
            colorScheme='gray'
            isDisabled={!humanAnswer.trim() || !aiAnswer.trim()}
            onClick={() => setStep(3)}
            width={{ base: 'full', sm: 'auto' }}
          >
            Next: Analyze traits
          </Button>
        </VStack>
      </VStack>
    </LayoutCard>
  )
}
