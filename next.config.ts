import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  transpilePackages: ['@assistant-ui/react', '@assistant-ui/react-ai-sdk'],
  poweredByHeader: false, // Hide X-Powered-By header
  reactStrictMode: true, // Enable React strict mode
  compress: true, // Enable gzip compression
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  webpack(config, { dev }) {
    config.experiments = { topLevelAwait: true, layers: true }
    // Add support for handling GraphQL files
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })

    config.module.rules.push({
      test: /\.well-known\/[^.]+$/,
      type: 'asset/source',
      exclude: /node_modules/,
    })

    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      })
    }

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 70000,
      },
      runtimeChunk: 'single', // This reduces duplication by sharing runtime code across bundles
      minimize: !dev, // Minify the bundles in production mode
      usedExports: true, // Tree-shake unused exports
    }

    return config
  },
  experimental: {
    optimizePackageImports: [
      'lodash',
      'neo4j-driver',
      '@neo4j/graphql',
      'react',
      'apollo-server-micro',
      '@chakra-ui/react',
    ],
    externalDir: true,
    serverSourceMaps: false,
    // optimizeCss: true,
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
