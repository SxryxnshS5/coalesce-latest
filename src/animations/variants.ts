export const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
}

export const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
}

export const listStagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const itemFade = {
  hidden: { opacity: 0, y: 6 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}
