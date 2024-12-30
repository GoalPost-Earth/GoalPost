import { createSystem, defaultConfig } from '@chakra-ui/react'

export const customTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        contrastWhite: { value: '#F9FBFD' },
        brand: {
          50: { value: '#fdf3e9' },
          // 100: { value: '#fbe1c7' },
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
        heading: { value: 'var(--font-urbanist)' },
        body: { value: 'var(--font-urbanist)' },
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
      },
    },
  },
})
