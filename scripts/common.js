import path from 'path'
import { execaSync } from 'execa'
import { templateName, templateFileName } from './config.js'

const TEMPLATE_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  ''
)

const shouldUseYarn = () => {
  try {
    execaSync('yarnpkg', ['--version'])
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

const runner = shouldUseYarn() ? 'yarn' : 'npm'

const concurrentOpts = {
  restartTries: 3,
  prefix: '{time} {name} |',
  timestampFormat: 'HH:mm:ss',
}

export { templateName, templateFileName, concurrentOpts, runner, TEMPLATE_DIR }
