import concurrently from 'concurrently'

import { TEMPLATE_DIR, runner, concurrentOpts, templateName } from './common.js'

const jobs = []

jobs.push({
  name: templateName,
  command: `cd ${TEMPLATE_DIR} && ${runner} run dev`,
  prefixColor: 'blue',
})
jobs.push({
  name: 'Codegen',
  command: `cd ${TEMPLATE_DIR} && ${runner} run codegen`,
  prefixColor: 'magenta',
})

const { result } = concurrently(jobs, concurrentOpts)

result.catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e.message)
})
