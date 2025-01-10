import { createSystem, defaultConfig } from '@chakra-ui/react'

export const customTheme = createSystem(defaultConfig, {
  globalCss: {
    body: {
      height: '100%',
      position: 'relative',
    },
    html: {
      scrollBehavior: 'smooth',
      bg: 'contrastWhite',
    },
  },
  theme: {
    tokens: {
      colors: {
        contrastWhite: { value: '#F9FBFD' },
        brandIcons: {
          50: { value: '#FFFAF0' },
          100: { value: '#FEEBCB' },
          200: { value: '#FBD38D' },
          300: { value: '#F6AD55' },
          400: { value: '#ED8936' },
          500: { value: '#DD6B20' },
          600: { value: '#C05621' },
          700: { value: '#9C4221' },
          800: { value: '#7B341E' },
          900: { value: '#652B19' },
        },
        brand: {
          DEFAULT: { value: '#e19e48' },
          50: { value: '#FFFAF0' },
          100: { value: '#FFFFFF' },
          200: { value: '#f7c89b' },
          300: { value: '#f3a96a' },
          400: { value: '#ef8a3e' },
          500: { value: '#e19e48' },
          600: { value: '#d07e3a' },
          700: { value: '#b15f2d' },
          800: { value: '#914421' },
          900: { value: '#6f2e17' },
          950: { value: '#4e1d0e' },
        },
      },
      fonts: {
        colors: {
          primary: { value: '#E19E48' },
          secondary: { value: '#EE0F0F' },
        },
        heading: { value: 'var(--font-inter)' },
        body: { value: 'var(--font-inter)' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.brand.100}' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        community: {
          contrast: {
            value: { base: '{colors.white}', _dark: '{colors.white}' },
          },
          fg: {
            value: {
              base: '{colors.green.700}',
              _dark: '{colors.green.300}',
            },
          },
          subtle: {
            value: { base: '{colors.green.100}', _dark: '{colors.green.900}' },
          },
          muted: {
            value: { base: '{colors.green.200}', _dark: '{colors.green.800}' },
          },
          emphasized: {
            value: { base: '{colors.green.300}', _dark: '{colors.green.700}' },
          },
          solid: {
            value: {
              base: '{colors.green.600}',
              dark: '{colors.green.600}',
            },
          },
          focusRing: {
            value: {
              base: '{colors.green.600}',
              dark: '{colors.green.600}',
            },
          },
        },
        resource: {
          contrast: {
            value: { base: '{colors.white}', _dark: '{colors.white}' },
          },
          fg: {
            value: {
              base: '{colors.purple.700}',
              _dark: '{colors.purple.300}',
            },
          },
          subtle: {
            value: {
              base: '{colors.purple.100}',
              _dark: '{colors.purple.900}',
            },
          },
          muted: {
            value: {
              base: '{colors.purple.200}',
              _dark: '{colors.purple.800}',
            },
          },
          emphasized: {
            value: {
              base: '{colors.purple.300}',
              _dark: '{colors.purple.700}',
            },
          },
          solid: {
            value: {
              base: '{colors.purple.600}',
              dark: '{colors.purple.600}',
            },
          },
          focusRing: {
            value: {
              base: '{colors.purple.600}',
              dark: '{colors.purple.600}',
            },
          },
        },
        person: {
          contrast: {
            value: { base: '{colors.white}', _dark: '{colors.white}' },
          },
          fg: {
            value: {
              base: '{colors.blue.700}',
              _dark: '{colors.blue.300}',
            },
          },
          subtle: {
            value: {
              base: '{colors.blue.100}',
              _dark: '{colors.blue.900}',
            },
          },
          muted: {
            value: {
              base: '{colors.blue.200}',
              _dark: '{colors.blue.800}',
            },
          },
          emphasized: {
            value: {
              base: '{colors.blue.300}',
              _dark: '{colors.blue.700}',
            },
          },
          solid: {
            value: {
              base: '{colors.blue.600}',
              dark: '{colors.blue.600}',
            },
          },
          focusRing: {
            value: {
              base: '{colors.blue.600}',
              dark: '{colors.blue.600}',
            },
          },
        },
        corevalue: {
          contrast: {
            value: { base: '{colors.white}', _dark: '{colors.white}' },
          },
          fg: {
            value: {
              base: '{colors.teal.700}',
              _dark: '{colors.teal.300}',
            },
          },
          subtle: {
            value: {
              base: '{colors.teal.100}',
              _dark: '{colors.teal.900}',
            },
          },
          muted: {
            value: {
              base: '{colors.teal.200}',
              _dark: '{colors.teal.800}',
            },
          },
          emphasized: {
            value: {
              base: '{colors.teal.300}',
              _dark: '{colors.teal.700}',
            },
          },
          solid: {
            value: {
              base: '{colors.teal.600}',
              dark: '{colors.teal.600}',
            },
          },
          focusRing: {
            value: {
              base: '{colors.teal.600}',
              dark: '{colors.teal.600}',
            },
          },
        },
        carepoints: {
          contrast: {
            value: { light: '{colors.white}', _dark: '{colors.white}' },
          },
          fg: {
            value: {
              light: '{colors.cyan.700}',
              _dark: '{colors.cyan.300}',
            },
          },
          subtle: {
            value: {
              base: '{colors.cyan.100}',
              _dark: '{colors.cyan.900}',
            },
          },
          muted: {
            value: {
              light: '{colors.cyan.200}',
              _dark: '{colors.cyan.800}',
            },
          },
          emphasized: {
            value: {
              light: '{colors.cyan.300}',
              _dark: '{colors.cyan.700}',
            },
          },
          solid: {
            value: {
              light: '{colors.cyan.600}',
              dark: '{colors.cyan.600}',
            },
          },
          focusRing: {
            value: {
              light: '{colors.cyan.600}',
              dark: '{colors.cyan.600}',
            },
          },
        },
        goal: {
          contrast: {
            value: { base: '{colors.dark}', _dark: '{colors.white}' },
          },
          fg: {
            value: {
              base: '{colors.yellow.800}',
              _dark: '{colors.yellow.300}',
            },
          },
          subtle: {
            value: {
              base: '{colors.yellow.100}',
              _dark: '{colors.yellow.900}',
            },
          },
          muted: {
            value: {
              base: '{colors.yellow.200}',
              _dark: '{colors.yellow.800}',
            },
          },
          emphasized: {
            value: {
              base: '{colors.yellow.300}',
              _dark: '{colors.yellow.700}',
            },
          },
          solid: {
            value: {
              base: '{colors.yellow.300}',
              dark: '{colors.yellow.300}',
            },
          },
          focusRing: {
            value: {
              base: '{colors.yellow.300}',
              dark: '{colors.yellow.300}',
            },
          },
        },
      },
    },
  },
})

export default customTheme
