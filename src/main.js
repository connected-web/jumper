const exec = require('./utils/asyncExec')
const executeStrategy = require('./utils/executeStrategy')
const scriptReport = (...messages) => console.log('[JUMPER]', ...messages)

function reportResults (results) {
  results.forEach((result, i) => {
    const error = result.error || {}
    const stringError = (typeof error === 'string') ? error : false
    const formats = [`[${i}] ${result.repo}`, error.message, error.stdout, error.stderr, stringError, 'Completed OK'].filter(n => n)
    console.log(...formats)
  })
}

async function run ({ strategy, repoList, cwd, reference }) {
  /* Start of software updater script */
  scriptReport('Cleaning and creating repos/ folder in', cwd)
  await exec('rm -rf repos')
  await exec('mkdir -p repos')

  scriptReport('Cleaning and creating logs/ folder in', cwd)
  await exec('rm -rf logs')
  await exec('mkdir -p logs')

  scriptReport('Running against:')
  console.log(repoList.map((repo, i) => `  [${i}] ${repo}`).join('\n'))

  const pendingWork = repoList.map((repo, index) => executeStrategy(repo, index, strategy, reference))
  const results = await Promise.all(pendingWork)

  reportResults(results)
}

module.exports = {
  run
}
