export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
}

export const float = {
  animate: { y: [0, -20, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
}
