export const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
}

export const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
}

export const listStagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const itemFade = {
  hidden: { opacity: 0, y: 6 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}
