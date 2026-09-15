/**
 * The "boot handoff" contract between the inline `<script>` the root layout
 * emits and the client-side `access-token-client.ts` cache (GOAL-375).
 *
 * WHY IT EXISTS
 * -------------
 * The access token is an HttpOnly cookie, so the browser cannot read it — but
 * Apollo needs it as an `Authorization: Bearer` header (ADR-013). That made
 * `GET /api/auth/access-token` the first thing every protected page did *after*
 * its JS had downloaded, parsed, and hydrated — a strictly serial hop in front
 * of the shell query:
 *
 *     navigation → HTML → JS chunks → hydrate → /api/auth/access-token → GraphQL
 *
 * Measured on dev from a fresh tab, cache disabled, Fast-3G throttled: the
 * access-token request started at ~10.2 s (hydration finishes there) and took
 * ~580 ms, so the first GraphQL request left the browser at ~10.8 s.
 *
 * Nothing in that hop depends on React. The request only needs the cookie,
 * which the browser already has at the first byte of HTML. So the root layout
 * emits a tiny nonce'd inline script that fires the fetch during HTML parse and
 * parks the (already-normalised, already-JSON-parsed) result on `window` under
 * `ACCESS_TOKEN_BOOT_PROPERTY`. By the time hydration finishes and Apollo's
 * authLink asks for a bearer, the answer is usually already sitting there — the
 * hop has overlapped the JS download instead of following it.
 *
 * This is a SCHEDULING change only. The token still comes from the same route,
 * over the same HttpOnly cookie, with the same server-side verification; the
 * client never gains the ability to mint or forge one.
 *
 * The script is only emitted when an auth cookie is actually present, so a
 * logged-out visitor on `/auth/login` pays nothing.
 */

/** `window` property the boot script parks its promise on. */
export const ACCESS_TOKEN_BOOT_PROPERTY = '__gpAccessTokenBoot'

/**
 * Normalised result of the boot fetch. The script resolves — never rejects —
 * so a consumer can `await` it without a try/catch, and a network blip during
 * boot is reported as `{ ok: false, status: 0 }` rather than a dead session.
 */
export type AccessTokenBootResult =
  | { ok: true; accessToken?: string; expiresAt?: number }
  | { ok: false; status: number }

export interface AccessTokenBootWindow {
  [ACCESS_TOKEN_BOOT_PROPERTY]?: Promise<AccessTokenBootResult>
}

/**
 * The inline script source. The EMITTED code is deliberately ES5-flavoured —
 * no arrow functions, no `const`/`let`, no template literals — so it needs no
 * transpile step and can be embedded verbatim. (The constant below is
 * assembled with a template literal at build time; that is not part of what
 * ships to the browser.) It parses the JSON here rather than parking a bare
 * `Response`, so the consumer gets plain data and the common 200 path never
 * leaves a stream unread.
 *
 * The promise NEVER rejects: `fetch` failure is caught by the outer `.then`'s
 * second argument, a malformed body by the inner one, and a synchronous throw
 * during setup by the `try`. Consumers can `await` it without a try/catch.
 *
 * `cache:'no-store'` is belt-and-braces on the one request now sitting at the
 * very front of the page: this response must never be replayed from an HTTP
 * cache, however the route's headers might change later.
 *
 * Published with `defineProperty(writable:false)` rather than plain assignment
 * so an in-page script cannot CLOBBER the promise between HTML parse and
 * hydration. That matters because the consumer trusts this value: a forged
 * `{ok:false,status:401}` would force-log-out the tab, and a forged
 * `{ok:true,accessToken:...}` would be session fixation. It is the same
 * reasoning that keeps the `session-expired` bus module-private in
 * `access-token-client.ts`. `configurable:true` so the consumer can still
 * `delete` it to enforce consume-once.
 *
 * It requires the CSP nonce `middleware.ts` stamps on the request — under
 * `script-src 'strict-dynamic'` an un-nonced inline script is simply blocked.
 */
export const ACCESS_TOKEN_BOOT_SCRIPT = `(function(){try{var p=fetch('/api/auth/access-token',{credentials:'include',cache:'no-store'}).then(function(r){if(r.status===200){return r.json().then(function(d){return {ok:true,accessToken:d&&d.accessToken,expiresAt:d&&d.expiresAt}},function(){return {ok:false,status:0}})}return {ok:false,status:r.status}},function(){return {ok:false,status:0}});Object.defineProperty(window,'${ACCESS_TOKEN_BOOT_PROPERTY}',{value:p,writable:false,configurable:true})}catch(e){}})();`
