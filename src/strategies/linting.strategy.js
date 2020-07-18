const path = require('path')
const { readJson } = require('../utils/asyncFs')

function lintingStrategy (repo, startwd, reference) {
  const cwd = `${startwd}/repos/${repo}`
  const strategyUrl = 'https://github.com/connected-web/jumper/blob/master/src/strategies/linting.strategy.js'
  const branchName = reference + '-jumper-linting'
  const commitMessage1 = `${reference} Removed and rebuilt the package-lock file with latest linting tools.\n${strategyUrl}`
  const commitMessage2 = `Lint all files using the preferred linting command.\n${strategyUrl}`
  const pullRequestTitle = `${reference}: Update linter and apply linting`
  const pullRequestMessage = `${reference} This is an automated pull-request generated using the [JUMPER rebuild strategy](${strategyUrl}).`

  let packageData = {}
  let dependencies = {}
  let devDependencies = {}

  const removeStandard = { command: 'npm uninstall standard', cwd }
  const installStandard = { command: 'npm install -D standard', cwd }

  async function readDependenciesFromPackageJson ({ command, cwd, report }) {
    const packagePath = path.join(cwd, 'package.json')
    packageData = await readJson(packagePath)

    dependencies = packageData.dependencies || {}
    devDependencies = packageData.devDependencies || {}
  }

  async function checkForLintCommand ({ command, cwd, report }) {
    if (packageData.scripts && packageData.scripts.lint) {
      report('Lint command found:', packageData.scripts.lint)
    } else {
      throw new Error('No lint command found on repo; stopping here.')
    }
  }

  async function checkForStandard ({ command, cwd, report }) {
    if (dependencies.standard || devDependencies.standard) {
      report('Found standard; will attempt to upgrade to latest version.')
    } else {
      removeStandard.command = 'echo "Skipping step; do not need to remove standard as not part of the current project"'
      installStandard.command = 'echo "Skipping step; do not need to install standard as not part of the current project"'
    }
  }

  const steps = [
    { command: `git clone git@github.com:${repo}.git repos/${repo}`, cwd: startwd },
    { command: 'pwd', cwd },
    { command: `git push --delete origin ${branchName}`, cwd, optionalSuccess: true },
    { command: `git checkout -b ${branchName}`, cwd },
    { command: 'git status', cwd },
    { command: readDependenciesFromPackageJson, cwd },
    { command: checkForLintCommand, cwd },
    { command: checkForStandard, cwd },
    removeStandard,
    installStandard,
    { command: 'npm install', cwd },
    { command: 'npm run lint -s', cwd, optionalSuccess: true }, // allow the process to complete even if linting errors persist
    { command: 'git add package.json', cwd },
    { command: 'git add package-lock.json', cwd },
    { command: `git commit -n -m "${commitMessage1}"`, cwd },
    { command: 'git add . ', cwd }, // add all remaining linted files
    { command: `git commit -n -m "${commitMessage2}"`, cwd },
    { command: 'git status', cwd },
    { command: `git push --set-upstream origin ${branchName}`, cwd },
    { command: `hub pull-request -m "${pullRequestTitle}\n\n${pullRequestMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: 'hub pr show', cwd }
  ]

  return steps
}

module.exports = lintingStrategy
