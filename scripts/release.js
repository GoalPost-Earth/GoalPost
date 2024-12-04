/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line import/no-extraneous-dependencies
const concurrently = require('concurrently')
const { API_DIR, runner, concurrentOpts, TEMPLATE_DIR } = require('./common')

const versionBump = []
const release = []

switch (process.argv[2]) {
  case 'patch':
    versionBump.push(
      {
        name: 'bump-api',
        command: `cd ${API_DIR} && ${runner} version patch `,
        prefixColor: 'red',
      },
      {
        name: 'bump-frontend',
        command: `cd ${TEMPLATE_DIR} && ${runner} version patch`,
        prefixColor: 'red',
      }
    )
    release.push({
      name: 'release:patch',
      command:
        "changelog -p && git add . && git commit -m 'docs: update CHANGELOG.md' && npm version patch && git push origin && git push origin --tags",
      prefixColor: 'yellow',
    })
    break
  case 'minor':
    versionBump.push(
      {
        name: 'bump-api',
        command: `cd ${API_DIR} && ${runner} version minor`,
        prefixColor: 'red',
      },
      {
        name: 'bump-frontend',
        command: `cd ${TEMPLATE_DIR} && ${runner} version minor`,
        prefixColor: 'red',
      }
    )
    release.push({
      name: 'release:minor',
      command:
        "changelog -m && git add . && git commit -m 'docs: update CHANGELOG.md' && npm version minor && git push origin && git push origin --tags",
      prefixColor: 'yellow',
    })
    break
  case 'major':
    versionBump.push(
      {
        name: 'bump-api',
        command: `cd ${API_DIR} && ${runner} version major`,
        prefixColor: 'red',
      },
      {
        name: 'bump-frontend',
        command: `cd ${TEMPLATE_DIR} && ${runner} version major`,
        prefixColor: 'red',
      }
    )
    release.push({
      name: 'release:major',
      command:
        "changelog -M && git add . && git commit -m 'docs: update CHANGELOG.md' && npm version major && git push origin && git push origin --tags",
      prefixColor: 'yellow',
    })
    break
  default:
    break
}

const { result } = concurrently(versionBump, concurrentOpts)

result
  .then(() => concurrently(release, concurrentOpts))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e.message)
  })
