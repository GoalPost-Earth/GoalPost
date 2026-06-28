/**
 * Node-runtime-only instrumentation, split out of `instrumentation.ts`.
 *
 * Why a separate file: `middleware.ts` forces Next.js to compile
 * `instrumentation.ts` for the EDGE runtime as well as Node (instrumentation
 * runs in both). `@napi-rs/canvas` ships a platform-native `.node` binary that
 * cannot be bundled for edge/browser — webpack fails with "Node.js binary
 * module … is not supported in the browser" and Turbopack HANGS indefinitely
 * trying to resolve the per-platform `skia.*.node` variants, which leaves the
 * whole authenticated (`/protected/**`) tree unable to compile.
 *
 * `instrumentation.ts` imports this module only inside
 * `if (process.env.NEXT_RUNTIME === 'nodejs')`. The bundler constant-folds that
 * guard to `false` in the edge compile and dead-code-eliminates this dynamic
 * import, so `@napi-rs/canvas` never enters the edge bundle. The native binary
 * is also kept out of the Node server bundle by `serverExternalPackages` in
 * `next.config.ts`.
 */

/**
 * Install the browser globals that `pdfjs-dist` (pulled in by `pdf-parse`
 * during document ingestion) references at module-evaluation time. Without
 * these, loading pdf-parse on the Node runtime throws
 * `ReferenceError: DOMMatrix is not defined`, which previously cascaded into
 * 500s across the whole GraphQL API. Implementations are sourced from
 * `@napi-rs/canvas` (already a transitive dependency of pdf-parse) so the
 * polyfilled classes match what pdfjs expects.
 */
export async function installNodePdfGlobals(): Promise<void> {
  const g = globalThis as Record<string, unknown>

  // Only patch what's missing — never clobber a real platform global.
  const needsCanvasGlobals =
    typeof g.DOMMatrix === 'undefined' ||
    typeof g.Path2D === 'undefined' ||
    typeof g.ImageData === 'undefined' ||
    typeof g.DOMPoint === 'undefined'

  if (needsCanvasGlobals) {
    const canvas = await import('@napi-rs/canvas')
    if (typeof g.DOMMatrix === 'undefined') g.DOMMatrix = canvas.DOMMatrix
    if (typeof g.Path2D === 'undefined') g.Path2D = canvas.Path2D
    if (typeof g.ImageData === 'undefined') g.ImageData = canvas.ImageData
    if (typeof g.DOMPoint === 'undefined') g.DOMPoint = canvas.DOMPoint
  }

  // pdfjs-dist v5 also uses Promise.withResolvers (Node 22+). Polyfill it
  // defensively in case the deployment runs on an older Node runtime.
  if (
    typeof (Promise as unknown as { withResolvers?: unknown }).withResolvers ===
    'undefined'
  ) {
    ;(Promise as unknown as { withResolvers: unknown }).withResolvers =
      function withResolvers<T>() {
        let resolve!: (value: T | PromiseLike<T>) => void
        let reject!: (reason?: unknown) => void
        const promise = new Promise<T>((res, rej) => {
          resolve = res
          reject = rej
        })
        return { promise, resolve, reject }
      }
  }
}
