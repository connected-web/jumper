function checkoutStrategy (repo, startwd) {
  const cwd = `${startwd}/repos/${repo}`
  const steps = [
    { command: `git clone git@github.com:${repo}.git repos/${repo}`, cwd: startwd },
    { command: 'pwd', cwd },
    { command: 'git status', cwd }
  ]

  return steps
}

module.exports = checkoutStrategy
