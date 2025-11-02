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
      bg='rgba(255,255,255,0.035)'
      borderWidth='1px'
      borderColor='whiteAlpha.150'
      backdropFilter='blur(8px)'
      rounded='xl'
      shadow='lg'
      p={{ base: 4, md: 6 }}
      // keep variants for mount/unmount only; no hover/tap scaling for minimal feel
      {...props}
    />
  )
}
