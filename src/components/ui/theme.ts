import { createSystem, defaultConfig } from '@chakra-ui/react'

export const customTheme = createSystem(defaultConfig, {
  globalCss: {
    body: {
      bg: 'contrastWhite',
      minHeight: '100vh',
      height: '100%',
      position: 'relative',
    },
    html: {
      height: '100%',
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
      },
    },
  },
})
