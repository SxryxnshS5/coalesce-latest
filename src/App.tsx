import { Box, Container, Heading, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { pageVariants } from './animations/variants'
import { useAppStore } from './store/app'
import Stepper from './components/Stepper'
import Step1Question from './sections/Step1Question'
import Step2Answers from './sections/Step2Answers'
import Step3Traits from './sections/Step3Traits'
import Step4Collaborate from './sections/Step4Collaborate'
import Step5Compare from './sections/Step5Compare'

const MotionBox = motion(Box)

export default function App() {
  const { step } = useAppStore()
  return (
    <Container maxW='6xl' py={{ base: 6, md: 10 }}>
      <Heading
        size='lg'
        bgClip='text'
        bgGradient='linear(to-r, cyan.300, purple.300)'
        mb={1}
      >
        Coalesce
      </Heading>
      <Text color='whiteAlpha.800' mb={4}>
        A calm space where human and AI ideas meet halfway.
      </Text>
      <Stepper step={step} />
      <AnimatePresence mode='wait'>
        <MotionBox
          key={`step-${step}`}
          variants={pageVariants}
          initial='hidden'
          animate='enter'
          exit='exit'
        >
          {step === 1 && <Step1Question />}
          {step === 2 && <Step2Answers />}
          {step === 3 && <Step3Traits />}
          {step === 4 && <Step4Collaborate />}
          {step === 5 && <Step5Compare />}
        </MotionBox>
      </AnimatePresence>
    </Container>
  )
}
