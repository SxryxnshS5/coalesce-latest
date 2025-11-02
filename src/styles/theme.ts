import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    900: '#0a0a0a', // near black
    800: '#0e0e0e',
    700: '#141414',
  },
  // keep accents neutral
  accent: {
    slate: '#a3a3a3',
    muted: '#737373',
  },
  // Role colors (not used in components; radar handles its own palette)
  human: '#ffffff',
  ai: '#ffffff',
  collab: '#ffffff',
}

const styles = {
  global: {
    'html, body, #root': { minHeight: '100%' },
    body: {
      bgGradient: 'linear(to-b, brand.900, brand.800)',
      color: 'whiteAlpha.900',
      minHeight: '100vh',
      overflowX: 'hidden',
    },
    '::selection': {
      background: 'rgba(255,255,255,0.16)',
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
    outline: '0 0 0 3px rgba(255, 255, 255, 0.4)',
    glowGold: '0 0 18px rgba(255, 255, 255, 0.12)',
    glowCyan: '0 0 18px rgba(255, 255, 255, 0.12)',
  },
  components: {
    Button: {
      defaultProps: {
        variant: 'solid',
      },
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'white',
          color: 'gray.900',
          _hover: { bg: 'rgba(255,255,255,0.92)' },
          _active: { bg: 'rgba(255,255,255,0.85)' },
          _disabled: { bg: 'rgba(255,255,255,0.6)', color: 'gray.700' },
          _focusVisible: {
            boxShadow: '0 0 0 2px rgba(255,255,255,0.6)',
          },
        },
        outline: {
          bg: 'white',
          color: 'gray.900',
          borderColor: 'rgba(255,255,255,0.8)',
          _hover: { bg: 'rgba(255,255,255,0.92)' },
          _active: { bg: 'rgba(255,255,255,0.85)' },
          _focusVisible: {
            boxShadow: '0 0 0 2px rgba(255,255,255,0.6)',
          },
        },
        ghost: {
          bg: 'white',
          color: 'gray.900',
          _hover: { bg: 'rgba(255,255,255,0.92)' },
          _active: { bg: 'rgba(255,255,255,0.85)' },
          _focusVisible: {
            boxShadow: '0 0 0 2px rgba(255,255,255,0.6)',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'whiteAlpha.600',
        errorBorderColor: 'whiteAlpha.700',
      },
      variants: {
        filled: {
          field: {
            _focus: {
              borderColor: 'whiteAlpha.700',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.7) inset',
              background: 'whiteAlpha.200',
            },
            _hover: { background: 'whiteAlpha.200' },
          },
        },
        outline: {
          field: {
            _focus: {
              borderColor: 'whiteAlpha.700',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.7) inset',
            },
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'whiteAlpha.600',
        errorBorderColor: 'whiteAlpha.700',
      },
      variants: {
        filled: {
          _focus: {
            borderColor: 'whiteAlpha.700',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.7) inset',
            background: 'whiteAlpha.200',
          },
          _hover: { background: 'whiteAlpha.200' },
        },
        outline: {
          _focus: {
            borderColor: 'whiteAlpha.700',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.7) inset',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'whiteAlpha.600',
        errorBorderColor: 'whiteAlpha.700',
      },
      variants: {
        outline: {
          field: {
            _focus: {
              borderColor: 'whiteAlpha.700',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.7) inset',
            },
          },
        },
      },
    },
  },
})

export default theme
