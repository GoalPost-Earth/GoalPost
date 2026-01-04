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
  outputFileTracingIncludes: {
    '/': ['./node_modules/lightningcss/**/*'],
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development'

    return [
      // CORS headers for API routes in development
      ...(isDevelopment
        ? [
            {
              source: '/api/:path*',
              headers: [
                { key: 'Access-Control-Allow-Credentials', value: 'true' },
                { key: 'Access-Control-Allow-Origin', value: '*' },
                {
                  key: 'Access-Control-Allow-Methods',
                  value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
                },
                {
                  key: 'Access-Control-Allow-Headers',
                  value:
                    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Apollo-Require-Preflight',
                },
              ],
            },
          ]
        : []),
      // Security headers for all routes
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
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@apollo\/client/ },
    ]
    return config
  },
  experimental: {
    optimizePackageImports: [
      'lodash',
      'neo4j-driver',
      '@neo4j/graphql',
      'react',
      'apollo-server-micro',
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
