/* eslint-env mocha */
const { expect } = require('chai')
const fs = require('fs')

const { run } = require('../../src/main')
const helloStrategy = require('../../src/strategies/hello.strategy')

const logs = []
const collector = (...args) => {
  logs.push([...args])
}
const log = console.log

before(() => {
  while (logs.length > 0) {
    logs.pop()
  }
  console.log = collector
})

after(() => {
  console.log = log
})

function find (needle, haystack) {
  let found = haystack
  haystack.forEach(haybail => {
    if (haybail.includes(needle)) {
      found = haybail
    }
  })
  return found
}

describe('Jumper Integration', function () {
  const exampleRepoList = ['connected-web/example', 'connected-web/other-repo', 'connected-web/final-example']
  before(async function () {
    await run({
      strategy: helloStrategy,
      repoList: exampleRepoList,
      cwd: process.cwd()
    })
  })

  it('outputs the correct number of logs', async function () {
    const files = await fs.readdirSync('./logs/')
    expect(files.length).to.equal(3)
  })

  it('outputs log files with the correct names', async function () {
    const files = await fs.readdirSync('./logs/')
    const expectedFiles = exampleRepoList.map(repo => repo.replace('/', '-') + '.log')
    expect(files).to.have.deep.members(expectedFiles)
  })

  it('reports that its cleaning and creating the repos/ folder', async function () {
    const actual = find('Cleaning and creating repos/ folder in', logs)
    expect(actual).to.deep.equal(['[JUMPER]', 'Cleaning and creating repos/ folder in', process.cwd()])
  })

  it('reports that its cleaning and creating the logs/ folder', async function () {
    const actual = find('Cleaning and creating logs/ folder in', logs)
    expect(actual).to.deep.equal(['[JUMPER]', 'Cleaning and creating logs/ folder in', process.cwd()])
  })
})
