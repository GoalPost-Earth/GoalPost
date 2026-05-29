/**
 * Next.js instrumentation hook — runs once per server process, before any
 * route handler. We use it to install the browser globals that `pdfjs-dist`
 * (pulled in by `pdf-parse` during document ingestion) references at module
 * evaluation time. Without these, loading pdf-parse on the serverless Node
 * runtime throws `ReferenceError: DOMMatrix is not defined`, which previously
 * cascaded into 500s across the whole GraphQL API (the pdf-parse import sat in
 * the eagerly-loaded resolver graph — now lazy-loaded, see
 * document-text-extractor.ts / document-import-service.ts).
 *
 * Source the implementations from `@napi-rs/canvas`, which `pdf-parse` already
 * depends on, so we don't add a new dependency and the polyfilled classes match
 * what pdfjs expects. Node-runtime only; the Edge runtime never touches PDFs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

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
  if (typeof (Promise as unknown as { withResolvers?: unknown }).withResolvers === 'undefined') {
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
