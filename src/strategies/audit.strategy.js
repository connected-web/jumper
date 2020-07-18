const exec = require('../utils/asyncExec')
const slug = require('../utils/slug')

async function auditAndEarlyExit ({ cwd, report }) {
  let auditResult
  try {
    const execution = await exec('npm audit --parseable', { cwd })
    auditResult = execution.stdout || execution.stderr
  } catch (ex) {
    auditResult = ex.message
  }

  const issues = auditResult.trim()
  if (issues.length === 0) {
    throw new Error('No issues found after npm audit --parseable')
  }
  report(auditResult)
}

function auditStrategy (repo, startwd, reference) {
  const cwd = `${startwd}/repos/${repo}`
  const branchName = slug(reference) + '-jumper-audit'
  const commitMessage = 'Applied npm audit fix --force on project\nSee: https://github.com/connected-web/jumper/blob/master/src/strategies/audit.strategy.js'
  const pullRequestMessage = 'This is an automated pull-request generated using the [JUMPER](https://github.com/connected-web/jumper) [audit strategy](https://github.com/connected-web/jumper/blob/master/src/strategies/audit.strategy.js).'

  const steps = [
    { command: 'npm -v', cwd: startwd },
    { command: `git clone git@github.com:${repo}.git repos/${repo}`, cwd: startwd }, // *
    { command: 'pwd', cwd },
    { command: `git push --delete origin ${branchName}`, cwd, optionalSuccess: true },
    { command: `git checkout -b ${branchName}`, cwd },
    { command: auditAndEarlyExit, cwd },
    { command: 'npm audit fix --force', cwd },
    { command: 'git add package.json', cwd },
    { command: 'git add package-lock.json', cwd },
    { command: `git commit -m "${reference} ${commitMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: `git push --set-upstream origin ${branchName}`, cwd },
    { command: `hub pull-request -m "${reference}: npm audit fix\n\n${pullRequestMessage}"`, cwd },
    { command: 'git status', cwd },
    { command: 'hub pr show', cwd }
  ]

  return steps
}

module.exports = auditStrategy
