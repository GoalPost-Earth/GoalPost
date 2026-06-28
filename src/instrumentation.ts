/**
 * Next.js instrumentation hook — runs once per server process, before any
 * route handler, in BOTH the Node.js and Edge runtimes (the project has a
 * `middleware.ts`, which forces the edge compile).
 *
 * The actual work — installing the canvas-backed browser globals pdfjs-dist
 * needs, sourced from `@napi-rs/canvas` — lives in `./instrumentation-node`.
 * It is imported ONLY inside the `process.env.NEXT_RUNTIME === 'nodejs'` guard
 * so the bundler dead-code-eliminates it (and the native `@napi-rs/canvas`
 * `.node` binary) out of the edge bundle. Importing it directly here would pull
 * the native binary into the edge compile, which webpack rejects and Turbopack
 * hangs on — see `instrumentation-node.ts` for the full rationale.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { installNodePdfGlobals } = await import('./instrumentation-node')
    await installNodePdfGlobals()
  }
}
