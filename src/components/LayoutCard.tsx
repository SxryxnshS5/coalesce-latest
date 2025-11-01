import { Box, BoxProps } from '@chakra-ui/react'
import { motion, type MotionProps } from 'framer-motion'
import { cardVariants } from '../animations/variants'

type Props = BoxProps & MotionProps

export default function LayoutCard(props: Props) {
  return (
    <Box
      as={motion.div}
      variants={cardVariants}
      initial='hidden'
      animate='enter'
      exit='exit'
      bg='whiteAlpha.50'
      borderWidth='1px'
      borderColor='whiteAlpha.200'
      backdropFilter='blur(8px)'
      rounded='xl'
      shadow='lg'
      p={{ base: 4, md: 6 }}
      {...props}
    />
  )
}
