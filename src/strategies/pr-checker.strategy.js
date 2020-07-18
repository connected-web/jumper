const path = require('path')
const { read, readJson, write } = require('../utils/asyncFs')

function prCheckerStrategy (repo, startwd) {
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
    { command: checkForPackageJSON, cwd: repowd, startwd },
    { command: checkForTestCommand, cwd: repowd, startwd },
    { command: loadPRCheckYAMLTemplate, cwd: repowd, startwd },
    { command: checkForPRCheckYAML, cwd: repowd, startwd },
    { command: 'mkdir -p .github/workflows', cwd: repowd, startwd },
    { command: createPRCheckYAML, cwd: repowd, startwd }
  ]

  return steps
}

module.exports = prCheckerStrategy
