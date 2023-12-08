function aocStrategy (repo, startwd) {
  const repowd = `${startwd}/repos/${repo}`
  const steps = [
    { command: `git clone git@github.com:${repo}.git repos/${repo}`, cwd: startwd },
    { command: 'pwd', cwd: repowd },
    { command: 'echo "\ninput.txt" >> .gitignore', cwd: repowd, startwd },
    { command: 'echo "\nexample.txt" >> .gitignore', cwd: repowd, startwd },
    { command: 'echo "\ntes*.txt" >> .gitignore', cwd: repowd, startwd },
    { command: 'git add .gitignore', cwd: repowd, startwd },
    { command: 'git commit -m "Ignore input.txt based on AoC license restrictions"', cwd: repowd, startwd },
    { command: 'git filter-repo --path-glob **/input.txt --invert-paths --force', cwd: repowd, startwd },
    { command: 'git filter-repo --path-glob **/example.txt --invert-paths --force', cwd: repowd, startwd },
    { command: 'git filter-repo --path-glob **/tes*.txt --invert-paths --force', cwd: repowd, startwd },
    { command: `git push --set-upstream git@github.com:${repo}.git main --force`, cwd: repowd, startwd }
  ]

  return steps
}

module.exports = aocStrategy
