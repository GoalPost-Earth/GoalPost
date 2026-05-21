import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

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
  // pdf-parse → pdfjs-dist loads pdf.worker.mjs via a relative dynamic import.
  // Bundling them into .next chunks breaks that lookup ("Setting up fake worker
  // failed"). Externalising forces server-side require from node_modules where
  // the relative worker path resolves correctly.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  async headers() {
    const corsOrigin =
      process.env.CORS_ORIGIN ||
      (process.env.NODE_ENV === 'development' ? '*' : 'http://localhost:3000')

    return [
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: corsOrigin },
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
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  // Webpack is no longer used - all configuration migrated to Turbopack
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      // Force all graphql imports to resolve to the exact same instance
      // This prevents the "Cannot use GraphQLNonNull from another module or realm" error
      graphql: 'graphql/index.js',
    },
    rules: {
      '*.gql': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.graphql': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '**/.well-known/*': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
