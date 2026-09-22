/**
 * Phase 1 resonance volume policy — before/after simulation against a live DB.
 *
 * Mirrors the constants and the selection order implemented in
 * src/lib/resonance/discovery/pattern-detector.ts so the numbers below are the
 * ones the shipped code would produce, not a separate model of it.
 *
 *   node simulate-resonance-policy.mjs [.env.demo]
 */
import neo4j from 'neo4j-driver'
import fs from 'node:fs'

const ENV_FILE = process.argv[2] || '.env.demo'
const SIMILARITY_FLOOR = 0.7
const ADAPTIVE_THRESHOLD_SIGMA = 1.5
const MIN_PULSES_FOR_ADAPTIVE_THRESHOLD = 8
const ADAPTIVE_SAMPLE_SIZE = 40
const MAX_PENDING_SUGGESTIONS_PER_PULSE = 3
const MIN_CONNECTION_CONFIDENCE = 0.75

const env = Object.fromEntries(
  fs.readFileSync(ENV_FILE, 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] })
)
const driver = neo4j.driver(env.NEO4J_URI, neo4j.auth.basic(env.NEO4J_USERNAME, env.NEO4J_PASSWORD))
const session = driver.session()
const num = (v) => (v && v.low !== undefined ? v.low : Number(v))

/** Neo4j's vector.similarity.cosine rescales raw cosine to [0,1] as (1+cos)/2. */
const neo4jScaleCosine = (a, b) => {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return (1 + dot / (Math.sqrt(na) * Math.sqrt(nb))) / 2
}

/** Greedy first-come cap, strongest first — exactly what the live degree guard does. */
const applyDegreeCap = (pairs, cap, key) => {
  const deg = {}, kept = []
  for (const p of [...pairs].sort((x, y) => y[key] - x[key])) {
    if ((deg[p.a] || 0) >= cap || (deg[p.b] || 0) >= cap) continue
    deg[p.a] = (deg[p.a] || 0) + 1; deg[p.b] = (deg[p.b] || 0) + 1
    kept.push(p)
  }
  return { kept, maxDegree: Math.max(0, ...Object.values(deg)), covered: Object.keys(deg).length }
}

const row = (...c) => console.log('  ' + c[0].toString().padEnd(26) + c.slice(1).map((x) => String(x).padStart(11)).join(''))

console.log(`\nResonance policy simulation — ${ENV_FILE}\n${'='.repeat(74)}`)

// ---------- Part 1: candidate selection, from embeddings ----------
const fields = await session.run(`
  MATCH (sp:Space)-[:HAS_CONTEXT]->(c:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
  WHERE c.deletedAt IS NULL AND p.deletedAt IS NULL AND p.embedding IS NOT NULL
  WITH sp, c, count(DISTINCT p) AS n WHERE n >= 2
  RETURN sp.name AS space, c.title AS field, c.id AS id, n ORDER BY n DESC LIMIT 12`)

console.log('\nPART 1 — candidate pairs admitted per field (deterministic, from embeddings)\n')
for (const rec of fields.records) {
  const id = rec.get('id'), n = num(rec.get('n'))
  const r = await session.run(`
    MATCH (c:FieldContext {id:$id})-[:HAS_SUBCONTEXT*0..10]->(sc:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
    WHERE sc.deletedAt IS NULL AND p.deletedAt IS NULL AND p.embedding IS NOT NULL
    WITH DISTINCT p ORDER BY p.createdAt DESC
    RETURN collect({id:p.id, e:p.embedding}) AS ps`, { id })
  const ps = r.records[0].get('ps')
  const pairs = []
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++)
    pairs.push({ a: ps[i].id, b: ps[j].id, s: neo4jScaleCosine(ps[i].e, ps[j].e) })
  if (!pairs.length) continue
  // The shipped resolver estimates mean/sd from the NEWEST ADAPTIVE_SAMPLE_SIZE
  // pulses (ordered, so it is reproducible), then applies the resulting cut to
  // every pair in the field. Mirror that split — estimating over the whole
  // field would report a cut the code never actually uses.
  const sample = ps.slice(0, ADAPTIVE_SAMPLE_SIZE)
  const sampleSims = []
  for (let i = 0; i < sample.length; i++) for (let j = i + 1; j < sample.length; j++)
    sampleSims.push(neo4jScaleCosine(sample[i].e, sample[j].e))
  const mean = sampleSims.reduce((x, y) => x + y, 0) / sampleSims.length
  const sd = Math.sqrt(sampleSims.reduce((x, y) => x + (y - mean) ** 2, 0) / sampleSims.length)
  const adaptive = sample.length >= MIN_PULSES_FOR_ADAPTIVE_THRESHOLD
    ? Math.max(SIMILARITY_FLOOR, mean + ADAPTIVE_THRESHOLD_SIGMA * sd) : SIMILARITY_FLOOR

  const before = pairs.filter((p) => p.s >= SIMILARITY_FLOOR)
  const beforeDeg = {}; before.forEach((p) => { beforeDeg[p.a] = (beforeDeg[p.a] || 0) + 1; beforeDeg[p.b] = (beforeDeg[p.b] || 0) + 1 })
  const after = applyDegreeCap(pairs.filter((p) => p.s >= adaptive), MAX_PENDING_SUGGESTIONS_PER_PULSE, 's')

  console.log(`\n  ${rec.get('space')} / ${rec.get('field')}  —  ${ps.length} pulses, ${pairs.length} possible pairs`)
  console.log(`  mean=${mean.toFixed(3)} sd=${sd.toFixed(3)} over ${sample.length} sampled  ->  adaptive cut ${adaptive.toFixed(3)} (was a flat ${SIMILARITY_FLOOR})`)
  row('', 'pairs', 'maxDegree', 'covered')
  row('  before (flat 0.70)', before.length, Math.max(0, ...Object.values(beforeDeg)), `${Object.keys(beforeDeg).length}/${ps.length}`)
  row('  after  (adaptive+cap)', after.kept.length, after.maxDegree, `${after.covered}/${ps.length}`)
  const pct = before.length ? Math.round((1 - after.kept.length / before.length) * 100) : 0
  console.log(`  reduction: ${pct}%`)
}

// ---------- Part 2: what the existing pending queue would look like ----------
console.log(`\n${'='.repeat(74)}\nPART 2 — the EXISTING pending queue under the new write-time rules\n`)
const sugg = await session.run(`
  MATCH (sp:Space)-[:HAS_SUGGESTION]->(s:ResonanceSuggestion)
  WHERE s.status = 'pending'
  MATCH (s)-[:SOURCE]->(a:FieldPulse), (s)-[:TARGET]->(b:FieldPulse)
  RETURN sp.name AS space, s.id AS id, s.confidence AS conf, s.label AS label, a.id AS a, b.id AS b`)
const all = sugg.records.map((r) => ({ space: r.get('space'), id: r.get('id'), c: Number(r.get('conf')), label: r.get('label'), a: r.get('a'), b: r.get('b') }))
const bySpace = {}
for (const s of all) (bySpace[s.space] ??= []).push(s)
for (const [space, list] of Object.entries(bySpace)) {
  const floored = list.filter((s) => s.c >= MIN_CONNECTION_CONFIDENCE)
  const capped = applyDegreeCap(floored, MAX_PENDING_SUGGESTIONS_PER_PULSE, 'c')
  const degNow = {}; list.forEach((s) => { degNow[s.a] = (degNow[s.a] || 0) + 1; degNow[s.b] = (degNow[s.b] || 0) + 1 })
  console.log(`\n  ${space}`)
  row('', 'suggestions', 'maxDegree', 'labels')
  row('  today', list.length, Math.max(0, ...Object.values(degNow)), new Set(list.map((s) => s.label)).size)
  row(`  confidence >= ${MIN_CONNECTION_CONFIDENCE}`, floored.length, '-', new Set(floored.map((s) => s.label)).size)
  row(`  + top-${MAX_PENDING_SUGGESTIONS_PER_PULSE}/pulse`, capped.kept.length, capped.maxDegree, new Set(capped.kept.map((s) => s.label)).size)
  console.log(`  a reviewer would face ${capped.kept.length} instead of ${list.length}  (${Math.round((1 - capped.kept.length / list.length) * 100)}% fewer)`)
}
console.log()
await session.close(); await driver.close()
