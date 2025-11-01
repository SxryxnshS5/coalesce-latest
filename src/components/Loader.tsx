import { HStack, Spinner, Text } from '@chakra-ui/react'

export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <HStack spacing={2} color='whiteAlpha.800'>
      <Spinner size='sm' />
      <Text fontSize='sm'>{label}</Text>
    </HStack>
  )
}
