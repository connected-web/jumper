function prCheckerStrategy (repo, startwd) {
  const repowd = `${startwd}/repos/${repo}`
  const steps = [
    { command: `echo "Checking ${repo} for a PR checker"`, cwd: repowd, startwd }
  ]

  return steps
}

module.exports = prCheckerStrategy
