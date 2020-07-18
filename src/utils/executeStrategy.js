const { write } = require('./asyncFs')
const executeCommand = require('./executeCommand')
const startwd = process.cwd()

const executeStrategy = async (repo, i, strategy, reference) => {
  console.log(`[${i}]`, 'Starting some work:', repo)

  const logs = []
  function report (...messages) {
    const now = new Date()
    const logsFormat = [`[${now}] [${repo}]`].concat(messages).filter(n => n)
    const consoleFormat = [`[${repo}]`].concat(messages).filter(n => n)
    logs.push(logsFormat.join(' '))
    console.log(...consoleFormat)
  }

  function quietReport (...messages) {
    const now = new Date()
    const format = [`[${now}] [${repo}]`].concat(messages).filter(n => n)
    logs.push(format.join(' '))
  }

  const commandSteps = strategy(repo, startwd, reference)

  let error = false
  try {
    // run each command in sequence
    while (commandSteps.length > 0) {
      const nextCommand = commandSteps.shift()
      if (nextCommand.optionalSuccess) {
        try {
          await executeCommand(nextCommand, report)
        } catch (ex) {
          quietReport('Optional command failed, continuing:', ex.stderr, ex.stdout, ex.error, ex.message)
        }
      } else {
        await executeCommand(nextCommand, report)
      }
    }
  } catch (ex) {
    report('Caught exception:', ex.stderr, ex.stdout, ex.error, ex.message)
    error = ex
  }

  const logFile = `${repo.replace(/\//g, '-')}.log`
  report('Writing log file to ./logs/' + logFile)
  await write(`logs/${logFile}`, logs.join('\n'))

  // Return the results
  return {
    repo,
    error
  }
}

module.exports = executeStrategy
