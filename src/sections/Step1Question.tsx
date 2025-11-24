import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import LayoutCard from '../components/LayoutCard'
import Editor from '../components/Editor'
import { useAppStore } from '../store/app'

const EXAMPLES = [
  'Is it ever okay to lie to protect someone’s feelings?',
  'Should we forgive someone who isn’t sorry?',
  'Is it ethical to use AI in hiring decisions?',
]

export default function Step1Question() {
  const { question, setQuestion, setStep } = useAppStore()

  return (
    <LayoutCard>
      <VStack align='stretch' spacing={4}>
        <Heading size='md'>Step 1 — Ask a reflective question</Heading>
        <Text color='whiteAlpha.800'>
          Start with a moral or reflective question to explore together.
        </Text>
        <Editor
          label='Your question'
          value={question}
          onChange={setQuestion}
          placeholder={EXAMPLES[0]}
          rows={4}
          autoFocus
        />
        <Box>
          <Text fontSize='sm' color='whiteAlpha.700' mb={2}>
            Try an example:
          </Text>
          <VStack align='stretch' spacing={2}>
            {EXAMPLES.map((e) => (
              <Button
                key={e}
                variant='ghost'
                onClick={() => setQuestion(e)}
                justifyContent='flex-start'
                textAlign='left'
                whiteSpace='normal'
                height='auto'
                py={3}
                px={4}
              >
                {e}
              </Button>
            ))}
          </VStack>
        </Box>
        <Button
          colorScheme='gray'
          isDisabled={!question.trim()}
          onClick={() => setStep(2)}
          alignSelf={{ base: 'stretch', sm: 'flex-end' }}
          width={{ base: 'full', sm: 'auto' }}
        >
          Next: Write answers
        </Button>
      </VStack>
    </LayoutCard>
  )
}
