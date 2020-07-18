const exec = require('./asyncExec')

async function executeCommand (item, report, repo) {
  item.report = item.report || report
  let result = false
  if (typeof item.command === 'string') {
    report(item.command, 'from', item.cwd)
    result = await exec(item.command, item)
    report(result.stdout || result.stderr)
  } else if (typeof item.command === 'function') {
    result = await item.command(item)
    report(result)
  } else {
    throw new Error(['Unknown command type', typeof item, 'for', repo].join(' '))
  }
}

module.exports = executeCommand
