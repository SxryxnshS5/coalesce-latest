import { motion } from 'framer-motion'

export default function BackgroundAurora() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0.25 }}
        animate={{
          opacity: [0.25, 0.4, 0.25],
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background:
            'radial-gradient(40% 35% at 30% 30%, rgba(249, 115, 22, 0.15), transparent 60%), radial-gradient(50% 45% at 70% 60%, rgba(250, 204, 21, 0.12), transparent 60%), radial-gradient(35% 30% at 50% 40%, rgba(167, 139, 250, 0.10), transparent 60%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  )
}
