#!/usr/bin/env node

const yargs = require('yargs')
const main = require('../')
const strategies = require('../src/strategies')
const { exists, read } = require('../src/utils/asyncFs')
const report = (...messages) => console.log('[JUMPER CLI]', ...messages)

function getArgs () {
  const defaultReposPath = 'repolist.txt'
  return yargs
    .usage('Usage: -r <repolist.txt> -s <audit> -r <tvpx-200>')
    .option('r', { alias: 'repoList', describe: 'The filename containing the list of github repos to run strategies against; in the format org/reponame, one per line.', type: 'string', default: defaultReposPath, demandOption: false })
    .option('s', { alias: 'strategy', describe: 'The string name of the strategy to run', type: 'string', demandOption: true })
    .option('t', { alias: 'reference', describe: 'The reference related to this work', type: 'string', default: 'unreferenceed-work', demandOption: false })
    .example('jumper -s hello', `Execute the hello strategy against all repos in ${defaultReposPath}`)
    .argv
}

async function getRepositoryList (repoListFilepath) {
  let repoList = []
  try {
    repoList = (await read(repoListFilepath, 'utf8'))
      .split('\n')
      .map(line => line.trim())
      .filter(n => n)
  } catch (ex) {
    report('Unable to read repo list from:', `"${repoListFilepath}"`, ex)
    repoList = []
  }
  if (repoList.length === 0) {
    report('Was not able to obtain a list of repositories to run against')
    process.exit(1)
  }
  return repoList
}

async function verifyArgsValidity (args) {
  const strategyName = args.strategy
  const repoListFilepath = args.repoList

  const selectedStrategy = strategies[strategyName]

  if (!selectedStrategy) {
    report('Selected strategy not recognised:', `${strategyName}`, 'Choose from:', Object.keys(strategies))
    process.exit(1)
  }

  if (!await exists(repoListFilepath)) {
    report('Selected repo list not found:', `"${repoListFilepath}".`, 'Please check that the file exists, or create that file in the local path.')
    process.exit(1)
  }
}

function slug (word) {
  return word.toLowerCase()
    .replace(/[.']/g, '')
    .replace(/[^a-z\d-]/g, ' ')
    .trim()
    .replace(/(\s)+/g, '-')
}

async function run () {
  report('Starting process')

  const cwd = process.cwd()
  const args = getArgs()
  await verifyArgsValidity(args)

  const repoList = await getRepositoryList(args.repoList)
  const reference = slug(args.reference)
  report('Found', repoList.length, 'repos to execute the', args.strategy, 'strategy against for', reference)
  const strategy = strategies[args.strategy]

  try {
    await main.run({ strategy, repoList, cwd, reference })
  } catch (ex) {
    report('Unable to complete;', ex.message)
  }
}

run()
