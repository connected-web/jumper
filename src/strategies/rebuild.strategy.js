const path = require('path')
const { readJson } = require('../utils/asyncFs')

/**
 * Uses npm uninstall ${a} ${b} ${b} to completely remove all depdencies, and then
 * reinstall the latest available version using npm install ${a} ${b} ${c}.
 * Processes dependencies and devDependencies separately.
 * After updating package.json in each repo it will raise a PR.
 */

function rebuildStrategy (repo, startwd, reference) {
  const cwd = `${startwd}/repos/${repo}`
  const branchName = reference + '-jumper-rebuild'
  const commitMessage = 'Removed and rebuilt the package-lock file.\nhttps://github.com/connected-web/jumper/blob/master/src/strategies/rebuild.strategy.js'
  const pullRequestMessage = 'This is an automated pull-request generated using the [JUMPER](https://github.com/connected-web/jumper) [rebuild strategy](https://github.com/connected-web/jumper/blob/master/src/strategies/rebuild.strategy.js).'

  let dependencies = {}
  let devDependencies = {}

  const uninstallCommand = { command: 'npm uninstall XXX', cwd }
  const installDependenciesCommand = { command: 'npm install XXX', cwd }
  const installDevDependenciesCommand = { command: 'npm install -D XXX', cwd }

  async function readDependenciesFromPackageJson ({ command, cwd, report }) {
    const packagePath = path.join(cwd, 'package.json')
    const packageData = await readJson(packagePath)

    dependencies = packageData.dependencies
    devDependencies = packageData.devDependencies
  }

  function setupUninstallCommands ({ report }) {
    const packageDependencyNames = Object.keys(dependencies)
    const packageDevDependencyNames = Object.keys(devDependencies)
    const packageNames = [].concat(packageDependencyNames, packageDevDependencyNames)
    uninstallCommand.command = uninstallCommand.command.replace('XXX', packageNames.join(' '))
    report('Updated the uninstall command:', uninstallCommand.command)
  }

  function setupInstallCommands ({ report }) {
    const packageDependencyNames = Object.keys(dependencies)
    installDependenciesCommand.command = installDependenciesCommand.command.replace('XXX', packageDependencyNames.join(' '))
    report('Updated the install dependencies command:', uninstallCommand.command)

    const packageDevDependencyNames = Object.keys(devDependencies)
    installDevDependenciesCommand.command = installDevDependenciesCommand.command.replace('XXX', packageDevDependencyNames.join(' '))
    report('Updated the install dev dependencies command:', uninstallCommand.command)
  }

  const steps = [
    { command: 'npm -v', cwd: startwd },
    { command: `git clone git@github.com:${repo}.git repos/${repo}`, cwd: startwd },
    { command: 'pwd', cwd },
    { command: `git push --delete origin ${branchName}`, cwd, optionalSuccess: true },
    { command: `git checkout -b ${branchName}`, cwd },
    { command: 'npm outdated -l', cwd, optionalSuccess: true },
    { command: 'rm package-lock.json', cwd },
    { command: 'rm -rf node_modules', cwd },
    { command: readDependenciesFromPackageJson, cwd },
    { command: setupUninstallCommands, cwd },
    { command: setupInstallCommands, cwd },
    uninstallCommand,
    installDependenciesCommand,
    installDevDependenciesCommand,
    { command: 'npm install', cwd },
    { command: 'npm update', cwd },
    { command: 'npm audit fix', cwd },
    { command: 'npm outdated -l', cwd, optionalSuccess: true },
    { command: 'git add package.json', cwd },
    { command: 'git add package-lock.json', cwd },
    { command: `git commit -m "${reference} ${commitMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: `git push --set-upstream origin ${branchName}`, cwd },
    { command: `hub pull-request -m "${reference}: npm package-lock rebuild\n\n${pullRequestMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: 'hub pr show', cwd }
  ]

  return steps
}

module.exports = rebuildStrategy
