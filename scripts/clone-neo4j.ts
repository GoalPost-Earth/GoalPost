/**
 * Full Neo4j clone: SOURCE database  ->  TARGET database (destructive replace).
 *
 *   npx tsx scripts/clone-neo4j.ts <source> <target> --confirm <targetUri>
 *
 * <source> / <target> are PROFILE names that resolve to a gitignored env file
 * `.env.<profile>` holding NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD:
 *
 *   local        -> .env.local        (dev Aura)
 *   demo         -> .env.demo         (EC2 demo box)
 *   production   -> .env.production   (PROD — handle with extreme care)
 *
 * What it does (see kb/08-migration.md for the ontology background):
 *   1. Backs up the TARGET's current nodes+rels to ./backups/<target>-<ts>.json
 *   2. Drops the TARGET's constraints + indexes, wipes all TARGET data
 *   3. Rebuilds the TARGET schema to EXACTLY match SOURCE (constraints +
 *      range/vector/fulltext indexes)
 *   4. Copies every SOURCE node and relationship 1:1 (labels, properties,
 *      and embeddings preserved verbatim)
 *   5. Asserts node/relationship parity SOURCE === TARGET
 *
 * This is a RAW, FAITHFUL clone — it does NOT curate. Everything in the source
 * (including test fixtures, assistant feedback, conversation history, seeded
 * demo spaces) lands in the target. When the target is `production`, curate the
 * source first or expect all of it to ship.
 *
 * Safety guards (all must pass before anything is wiped):
 *   - SOURCE_URI must differ from TARGET_URI (never clone a DB onto itself)
 *   - --confirm <uri> must be passed AND equal the resolved TARGET URI
 *   - A timestamped JSON backup of the target is always written first
 */
import fs from 'fs'
import path from 'path'
import neo4j, { Driver, Session } from 'neo4j-driver'

interface Conn {
  profile: string
  uri: string
  user: string
  pass: string
}

function readEnvFile(filename: string): Record<string, string> {
  const filePath = path.join(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return {}
  const out: Record<string, string> = {}
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function resolveConn(profile: string): Conn {
  const file = `.env.${profile}`
  const env = readEnvFile(file)
  const uri = env.NEO4J_URI
  const user = env.NEO4J_USERNAME
  const pass = env.NEO4J_PASSWORD
  if (!uri || !user || !pass) {
    throw new Error(
      `Profile "${profile}" is missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in ${file}. ` +
        `Create ${file} (gitignored) with those three vars.`
    )
  }
  return { profile, uri, user, pass }
}

function parseArgs() {
  const argv = process.argv.slice(2)
  const positional: string[] = []
  let confirm: string | undefined
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--confirm') {
      confirm = argv[++i]
    } else {
      positional.push(argv[i])
    }
  }
  const [source, target] = positional
  if (!source || !target) {
    throw new Error('Usage: tsx scripts/clone-neo4j.ts <source> <target> --confirm <targetUri>')
  }
  return { source, target, confirm }
}

const log = (...a: unknown[]) => console.log('[clone]', ...a)

async function readAll(session: Session, cypher: string, params: Record<string, unknown> = {}) {
  return (await session.run(cypher, params)).records
}
const count = async (s: Session, q: string) => (await s.run(q)).records[0].get('c').toNumber()

async function main() {
  const { source, target, confirm } = parseArgs()
  const src = resolveConn(source)
  const dst = resolveConn(target)

  log(`SOURCE  ${src.profile}  ${src.uri}`)
  log(`TARGET  ${dst.profile}  ${dst.uri}  (will be WIPED and replaced)`)

  if (src.uri === dst.uri) {
    throw new Error(`REFUSING: source and target URIs are identical (${src.uri}). Would clone a DB onto itself.`)
  }
  if (confirm !== dst.uri) {
    throw new Error(
      `REFUSING: destructive clone not confirmed.\n` +
        `  Re-run with:  --confirm ${dst.uri}\n` +
        `  (the --confirm value must exactly equal the resolved TARGET uri above)`
    )
  }

  const srcDriver: Driver = neo4j.driver(src.uri, neo4j.auth.basic(src.user, src.pass))
  const dstDriver: Driver = neo4j.driver(dst.uri, neo4j.auth.basic(dst.user, dst.pass))
  const s = srcDriver.session()
  const d = dstDriver.session()

  try {
    await s.run('RETURN 1')
    await d.run('RETURN 1')
    log('Connected to both databases.')

    // Preflight: both DBs must have APOC (used for wipe + node/rel creation)
    // BEFORE we drop any schema, so an APOC-less target fails while still intact.
    for (const [name, sess] of [['source', s], ['target', d]] as const) {
      try {
        await sess.run('RETURN apoc.version() AS v')
      } catch {
        throw new Error(`REFUSING: ${name} database does not have APOC available (required for the clone).`)
      }
    }

    // Preflight: the source must not carry leftover clone markers from a prior
    // aborted run, or they'd be copied forward as "faithful" data (parity blind).
    const srcTmp = await count(s, 'MATCH (n:`_CloneTmp`) RETURN count(n) AS c')
    if (srcTmp !== 0) {
      throw new Error(`REFUSING: source has ${srcTmp} leftover :_CloneTmp node(s) from a prior aborted clone. Clean the source first.`)
    }

    // ---- 0. Backup TARGET ---------------------------------------------------
    const backupDir = path.join(process.cwd(), 'backups')
    fs.mkdirSync(backupDir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `${dst.profile}-backup-${ts}.json`)
    log('Backing up TARGET ->', backupPath)
    const bNodes = await readAll(d, 'MATCH (n) RETURN elementId(n) AS eid, labels(n) AS labels, properties(n) AS props')
    const bRels = await readAll(d, 'MATCH (a)-[r]->(b) RETURN elementId(a) AS s, elementId(b) AS t, type(r) AS type, properties(r) AS props')
    // Serialize Neo4j driver types (Integer, temporals, Point) to their string
    // form so the backup is human-readable. NOTE: this backup is for INSPECTION,
    // not mechanical restore — there is no restore script yet (see kb/08-migration.md).
    const backupReplacer = (_k: string, v: unknown) => {
      if (typeof v === 'bigint') return v.toString()
      if (
        v != null &&
        (neo4j.isInt(v) ||
          neo4j.isDateTime(v) ||
          neo4j.isLocalDateTime(v) ||
          neo4j.isDate(v) ||
          neo4j.isTime(v) ||
          neo4j.isLocalTime(v) ||
          neo4j.isDuration(v) ||
          neo4j.isPoint(v))
      ) {
        return (v as { toString(): string }).toString()
      }
      return v
    }
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        {
          takenAt: new Date().toISOString(),
          note: 'Inspection-only snapshot; Neo4j types are stringified and NOT mechanically restorable.',
          profile: dst.profile,
          uri: dst.uri,
          nodes: bNodes.map((r) => ({ eid: r.get('eid'), labels: r.get('labels'), props: r.get('props') })),
          rels: bRels.map((r) => ({ s: r.get('s'), t: r.get('t'), type: r.get('type'), props: r.get('props') })),
        },
        backupReplacer,
        0
      )
    )
    log(`Backup written: ${bNodes.length} nodes, ${bRels.length} rels.`)

    // ---- 1. Read SOURCE schema ---------------------------------------------
    const srcConstraints = await readAll(s, 'SHOW CONSTRAINTS YIELD name, type, labelsOrTypes, properties RETURN name, type, labelsOrTypes, properties')
    const srcIndexes = await readAll(s, 'SHOW INDEXES YIELD name, type, entityType, labelsOrTypes, properties, options RETURN name, type, entityType, labelsOrTypes, properties, options')
    const constraintNames = new Set(srcConstraints.map((r) => r.get('name')))
    log(`SOURCE schema: ${srcConstraints.length} constraints, ${srcIndexes.length} indexes.`)

    // ---- 2. Read all SOURCE data -------------------------------------------
    log('Reading SOURCE nodes + relationships...')
    const srcNodes = await readAll(s, 'MATCH (n) RETURN elementId(n) AS eid, labels(n) AS labels, properties(n) AS props')
    const srcRels = await readAll(s, 'MATCH (a)-[r]->(b) RETURN elementId(a) AS s, elementId(b) AS t, type(r) AS type, properties(r) AS props')
    log(`SOURCE data: ${srcNodes.length} nodes, ${srcRels.length} rels.`)

    // ---- 3. Drop TARGET schema ---------------------------------------------
    log('Dropping TARGET constraints + indexes...')
    for (const r of await readAll(d, 'SHOW CONSTRAINTS YIELD name RETURN name')) {
      await d.run(`DROP CONSTRAINT \`${r.get('name')}\` IF EXISTS`)
    }
    for (const r of await readAll(d, "SHOW INDEXES YIELD name, type WHERE type <> 'LOOKUP' RETURN name")) {
      await d.run(`DROP INDEX \`${r.get('name')}\` IF EXISTS`)
    }

    // ---- 4. Wipe TARGET data -----------------------------------------------
    log('Wiping TARGET data...')
    await d.run("CALL apoc.periodic.iterate('MATCH (n) RETURN n', 'DETACH DELETE n', {batchSize: 1000})")
    const remaining = await count(d, 'MATCH (n) RETURN count(n) AS c')
    if (remaining !== 0) throw new Error(`TARGET wipe incomplete: ${remaining} nodes remain`)

    // ---- 5. Recreate SOURCE schema on TARGET -------------------------------
    log('Creating constraints on TARGET...')
    const unreproducedConstraints: string[] = []
    for (const r of srcConstraints) {
      const name = r.get('name')
      const type = r.get('type')
      const label = r.get('labelsOrTypes')[0]
      const props = (r.get('properties') as string[]).map((p) => `n.\`${p}\``).join(', ')
      let requirement: string
      if (type === 'UNIQUENESS') requirement = `IS UNIQUE`
      else if (type === 'NODE_KEY') requirement = `IS NODE KEY`
      else {
        // Existence / relationship / key constraints aren't reproduced here.
        // Warn loudly rather than silently emitting the wrong DDL.
        log(`  ! UNREPRODUCED constraint ${name} (type ${type}) — not recreated on target`)
        unreproducedConstraints.push(`${name} (${type})`)
        continue
      }
      const stmt = `CREATE CONSTRAINT \`${name}\` IF NOT EXISTS FOR (n:\`${label}\`) REQUIRE (${props}) ${requirement}`
      try { await d.run(stmt) } catch (e) { log('  ! constraint', name, (e as Error).message) }
    }
    if (unreproducedConstraints.length) {
      log(`  WARNING: ${unreproducedConstraints.length} source constraint(s) were NOT reproduced: ${unreproducedConstraints.join(', ')}`)
    }

    log('Creating indexes on TARGET...')
    for (const r of srcIndexes) {
      const name = r.get('name')
      const type = r.get('type')
      if (type === 'LOOKUP') continue // default token-lookup, always present
      if (constraintNames.has(name)) continue // backing index auto-created with its constraint
      const entityType = r.get('entityType')
      const label = r.get('labelsOrTypes')?.[0]
      const props = (r.get('properties') as string[]) || []
      if (!label || props.length === 0) { log('  ~ skip index', name, '(no label/props)'); continue }
      const pat = entityType === 'RELATIONSHIP' ? `()-[n:\`${label}\`]-()` : `(n:\`${label}\`)`
      let stmt: string
      if (type === 'VECTOR') {
        const cfg = r.get('options').indexConfig
        stmt =
          `CREATE VECTOR INDEX \`${name}\` IF NOT EXISTS FOR ${pat} ON (n.\`${props[0]}\`) ` +
          `OPTIONS {indexConfig: {\`vector.dimensions\`: ${neo4j.int(cfg['vector.dimensions']).toNumber()}, ` +
          `\`vector.similarity_function\`: '${cfg['vector.similarity_function']}'}}`
      } else if (type === 'RANGE') {
        stmt = `CREATE INDEX \`${name}\` IF NOT EXISTS FOR ${pat} ON (${props.map((p) => `n.\`${p}\``).join(', ')})`
      } else if (type === 'TEXT') {
        stmt = `CREATE TEXT INDEX \`${name}\` IF NOT EXISTS FOR ${pat} ON (n.\`${props[0]}\`)`
      } else if (type === 'POINT') {
        stmt = `CREATE POINT INDEX \`${name}\` IF NOT EXISTS FOR ${pat} ON (n.\`${props[0]}\`)`
      } else if (type === 'FULLTEXT') {
        // Carry the analyzer / eventual-consistency config so a tuned fulltext
        // index doesn't come back with defaults.
        const cfg = (r.get('options')?.indexConfig ?? {}) as Record<string, unknown>
        const opts: string[] = []
        if (cfg['fulltext.analyzer']) opts.push(`\`fulltext.analyzer\`: '${cfg['fulltext.analyzer']}'`)
        if (cfg['fulltext.eventually_consistent'] != null) opts.push(`\`fulltext.eventually_consistent\`: ${Boolean(cfg['fulltext.eventually_consistent'])}`)
        const optionsClause = opts.length ? ` OPTIONS {indexConfig: {${opts.join(', ')}}}` : ''
        stmt = `CREATE FULLTEXT INDEX \`${name}\` IF NOT EXISTS FOR ${pat} ON EACH [${props.map((p) => `n.\`${p}\``).join(', ')}]${optionsClause}`
      } else {
        log('  ~ skip index', name, `(unsupported type ${type})`); continue
      }
      try { await d.run(stmt) } catch (e) { log('  ! index', name, (e as Error).message) }
    }

    // Temp index so relationship endpoint lookups are fast.
    await d.run('CREATE INDEX clone_tmp_idx IF NOT EXISTS FOR (n:`_CloneTmp`) ON (n.`_srcEid`)')

    // ---- 6. Copy nodes ------------------------------------------------------
    log('Copying nodes...')
    const NODE_BATCH = 200
    for (let i = 0; i < srcNodes.length; i += NODE_BATCH) {
      const batch = srcNodes.slice(i, i + NODE_BATCH).map((r) => ({ eid: r.get('eid'), labels: r.get('labels'), props: r.get('props') }))
      await d.run(
        `UNWIND $batch AS row
         CALL apoc.create.node(row.labels + ['_CloneTmp'], apoc.map.merge(row.props, {_srcEid: row.eid})) YIELD node
         RETURN count(*) AS c`,
        { batch }
      )
    }

    // ---- 7. Copy relationships ---------------------------------------------
    log('Copying relationships...')
    const REL_BATCH = 500
    for (let i = 0; i < srcRels.length; i += REL_BATCH) {
      const batch = srcRels.slice(i, i + REL_BATCH).map((r) => ({ s: r.get('s'), t: r.get('t'), type: r.get('type'), props: r.get('props') }))
      await d.run(
        `UNWIND $batch AS row
         MATCH (a:_CloneTmp {_srcEid: row.s})
         MATCH (b:_CloneTmp {_srcEid: row.t})
         CALL apoc.create.relationship(a, row.type, row.props, b) YIELD rel
         RETURN count(*) AS c`,
        { batch }
      )
    }

    // ---- 8. Remove temp markers --------------------------------------------
    log('Cleaning up temp clone markers...')
    const cleanupRes = await d.run(
      "CALL apoc.periodic.iterate('MATCH (n:`_CloneTmp`) RETURN n', 'REMOVE n:`_CloneTmp` REMOVE n.`_srcEid`', {batchSize: 1000}) " +
        'YIELD batches, total, failedOperations, errorMessages RETURN batches, total, failedOperations, errorMessages'
    )
    const failedOps = cleanupRes.records[0]?.get('failedOperations')
    const failedCount = failedOps == null ? 0 : neo4j.int(failedOps).toNumber()
    if (failedCount > 0) {
      throw new Error(`Temp-marker cleanup had ${failedCount} failed operation(s): ${JSON.stringify(cleanupRes.records[0].get('errorMessages'))}`)
    }
    await d.run('DROP INDEX clone_tmp_idx IF EXISTS')
    // apoc.periodic.iterate does not throw on partial failure, so verify no
    // markers leaked into the final data (else parity would falsely pass).
    const leftTmp = await count(d, 'MATCH (n:`_CloneTmp`) RETURN count(n) AS c')
    const leftEid = await count(d, 'MATCH (n) WHERE n.`_srcEid` IS NOT NULL RETURN count(n) AS c')
    if (leftTmp !== 0 || leftEid !== 0) {
      throw new Error(`Temp markers leaked into target data: ${leftTmp} :_CloneTmp label(s), ${leftEid} _srcEid prop(s) remain.`)
    }

    // ---- 9. Parity ----------------------------------------------------------
    const srcN = await count(s, 'MATCH (n) RETURN count(n) AS c')
    const srcR = await count(s, 'MATCH ()-[r]->() RETURN count(r) AS c')
    const dstN = await count(d, 'MATCH (n) RETURN count(n) AS c')
    const dstR = await count(d, 'MATCH ()-[r]->() RETURN count(r) AS c')
    log('---- PARITY ----')
    log(`  nodes: source=${srcN}  target=${dstN}  ${srcN === dstN ? 'OK' : 'MISMATCH'}`)
    log(`  rels : source=${srcR}  target=${dstR}  ${srcR === dstR ? 'OK' : 'MISMATCH'}`)
    if (srcN !== dstN) throw new Error('Node count mismatch')
    if (srcR !== dstR) throw new Error('Rel count mismatch')

    // Per-label node counts and per-type rel counts — catches shape drift that
    // total counts alone would miss.
    const asMap = (records: import('neo4j-driver').Record[], k: string) => {
      const m = new Map<string, number>()
      for (const rec of records) m.set(rec.get(k), rec.get('c').toNumber())
      return m
    }
    const srcLabels = asMap(await readAll(s, 'MATCH (n) UNWIND labels(n) AS l RETURN l, count(*) AS c'), 'l')
    const dstLabels = asMap(await readAll(d, 'MATCH (n) UNWIND labels(n) AS l RETURN l, count(*) AS c'), 'l')
    const srcTypes = asMap(await readAll(s, 'MATCH ()-[r]->() RETURN type(r) AS l, count(*) AS c'), 'l')
    const dstTypes = asMap(await readAll(d, 'MATCH ()-[r]->() RETURN type(r) AS l, count(*) AS c'), 'l')
    const diffs: string[] = []
    for (const [label, n] of srcLabels) if (dstLabels.get(label) !== n) diffs.push(`label ${label}: source=${n} target=${dstLabels.get(label) ?? 0}`)
    for (const label of dstLabels.keys()) if (!srcLabels.has(label)) diffs.push(`label ${label}: source=0 target=${dstLabels.get(label)}`)
    for (const [t, n] of srcTypes) if (dstTypes.get(t) !== n) diffs.push(`rel ${t}: source=${n} target=${dstTypes.get(t) ?? 0}`)
    for (const t of dstTypes.keys()) if (!srcTypes.has(t)) diffs.push(`rel ${t}: source=0 target=${dstTypes.get(t)}`)
    if (diffs.length) throw new Error(`Per-label/per-type parity mismatch:\n  ${diffs.join('\n  ')}`)
    log(`  per-label parity: ${srcLabels.size} labels OK; per-type parity: ${srcTypes.size} rel types OK`)

    // Embedding spot check — confirm vector props round-tripped, not just counts.
    for (const [label, prop] of [
      ['FieldPulse', 'embedding'],
      ['Person', 'embedding'],
    ] as const) {
      const q = `MATCH (n:\`${label}\`) WHERE n.\`${prop}\` IS NOT NULL RETURN size(n.\`${prop}\`) AS c ORDER BY elementId(n) LIMIT 1`
      const sr = await s.run(q)
      if (sr.records.length === 0) continue // source has none of this vector prop; skip
      const srcLen = sr.records[0].get('c').toNumber()
      const dr = await d.run(q)
      const dstLen = dr.records.length ? dr.records[0].get('c').toNumber() : -1
      if (srcLen !== dstLen) throw new Error(`Embedding spot check failed for ${label}.${prop}: source len=${srcLen}, target len=${dstLen}`)
      log(`  embedding spot check ${label}.${prop}: len ${srcLen} OK`)
    }

    log(`Clone complete: ${src.profile} -> ${dst.profile}. Backup at ${backupPath}`)
  } finally {
    await s.close()
    await d.close()
    await srcDriver.close()
    await dstDriver.close()
  }
}

main().catch((e) => {
  console.error('[clone] FAILED:', e instanceof Error ? e.message : e)
  process.exit(1)
})
