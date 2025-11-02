import { Box, HStack, Text, Progress } from '@chakra-ui/react'

type Props = { step: number }

export default function Stepper({ step }: Props) {
  const pct = ((Math.min(5, Math.max(1, step)) - 1) / 4) * 100
  const labels = ['Question', 'Answers', 'Traits', 'Collaborate', 'Insight']
  return (
    <Box mb={4}>
      <HStack justify='space-between' mb={2}>
        {labels.map((l, i) => (
          <Text
            key={l}
            fontSize='xs'
            color={i + 1 <= step ? 'white' : 'whiteAlpha.700'}
          >
            {l}
          </Text>
        ))}
      </HStack>
      <Progress
        value={pct}
        size='sm'
        colorScheme='gray'
        bg='whiteAlpha.200'
        rounded='full'
      />
    </Box>
  )
}
