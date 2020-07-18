const path = require('path')
const { read, readJson, write } = require('../utils/asyncFs')
const slug = require('../utils/slug')

function prCheckerStrategy (repo, startwd, reference) {
  const cwd = `${startwd}/repos/${repo}`
  const branchName = slug(reference) + '-jumper-add-pr-check'
  const jumperSrcUrl = 'https://github.com/connected-web/jumper'
  const commitMessage = `Removed and rebuilt the package-lock file.\n${jumperSrcUrl}/blob/master/src/strategies/pr-checker.strategy.js`
  const pullRequestMessage = `This is an automated pull-request generated using the [JUMPER](${jumperSrcUrl}) [pr-checker strategy](${jumperSrcUrl}/blob/master/src/strategies/pr-checker.strategy.js).`

  let packageData, packageScripts, testCommand, prCheckYamlTemplate, prCheckYamlFile

  async function checkForPackageJSON ({ command, cwd, report }) {
    const packagePath = path.join(cwd, 'package.json')
    try {
      packageData = await readJson(packagePath)
    } catch (ex) {
      throw new Error(`No package.json found for ${repo}: ${ex.message}`)
    }
  }

  async function checkForTestCommand ({ command, cwd, report }) {
    packageScripts = packageData.scripts || {}
    testCommand = packageScripts.test

    if (!testCommand) {
      throw new Error(`No test command found in package.json for ${repo}`)
    }
  }

  async function loadPRCheckYAMLTemplate ({ command, cwd, report }) {
    const templatePath = path.join(__dirname, '../templates/pr-check.yml')
    try {
      prCheckYamlTemplate = await read(templatePath, 'utf8')
    } catch (ex) {
      throw new Error(`Unable to load PR Check YAML Template from ${templatePath}: ${ex.message}`)
    }
  }

  async function checkForPRCheckYAML ({ command, cwd, report }) {
    const filePath = path.join(cwd, './.github/workflows/pr-check.yml')
    try {
      prCheckYamlFile = await read(filePath, 'utf8')
    } catch (ex) {
      report(`No pr-check.yml workflow found in project; checked: '${filePath}'`)
    }

    if (prCheckYamlFile && prCheckYamlFile.length > prCheckYamlTemplate.length / 2) {
      throw new Error('Existing pr-check.yml workflow found; strategy abandoned')
    }
  }

  async function createPRCheckYAML ({ command, cwd, report }) {
    const filePath = path.join(cwd, './.github/workflows/pr-check.yml')
    try {
      await write(filePath, prCheckYamlTemplate, 'utf8')
    } catch (ex) {
      throw new Error(`Unable to write PR Check YAML Template to ${filePath}: ${ex.message}`)
    }
  }

  const repowd = `${startwd}/repos/${repo}`
  const steps = [
    { command: 'npm -v', cwd: startwd },
    { command: `git clone git@github.com:${repo}.git repos/${repo}`, cwd: startwd },
    { command: 'pwd', cwd },
    { command: checkForPackageJSON, cwd: repowd, startwd },
    { command: checkForTestCommand, cwd: repowd, startwd },
    { command: loadPRCheckYAMLTemplate, cwd: repowd, startwd },
    { command: checkForPRCheckYAML, cwd: repowd, startwd },
    { command: 'mkdir -p .github/workflows', cwd: repowd, startwd },
    { command: createPRCheckYAML, cwd: repowd, startwd },
    { command: `git push --delete origin ${branchName}`, cwd, optionalSuccess: true },
    { command: `git checkout -b ${branchName}`, cwd },
    { command: 'git add .github/workflows/pr-check.yml', cwd },
    { command: `git commit -m "${reference} ${commitMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: `git push --set-upstream origin ${branchName}`, cwd },
    { command: `hub pull-request -m "${reference}: npm package-lock rebuild\n\n${pullRequestMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: 'hub pr show', cwd }
  ]

  return steps
}

module.exports = prCheckerStrategy
