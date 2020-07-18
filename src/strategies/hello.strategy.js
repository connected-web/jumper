function helloStrategy (repo, startwd) {
  const repowd = `${startwd}/repos/${repo}`
  const steps = [
    { command: `echo "Hello ${repo}"`, cwd: repowd, startwd }
  ]

  return steps
}

module.exports = helloStrategy
