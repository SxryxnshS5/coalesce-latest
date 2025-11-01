import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    900: '#0f172a',
    800: '#1e293b',
    700: '#334155',
  },
  human: '#ec4899', // pink
  ai: '#22d3ee', // aqua
  collab: '#a78bfa', // lavender
}

const styles = {
  global: {
    body: {
      bgGradient: 'linear(to-b, brand.900, brand.700)',
      color: 'whiteAlpha.900',
      minHeight: '100vh',
    },
  },
}

const theme = extendTheme({
  config,
  colors,
  styles,
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  shadows: {
    outline: '0 0 0 3px rgba(34, 211, 238, 0.65)',
  },
})

export default theme
