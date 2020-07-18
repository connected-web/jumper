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

  it('reports the correct log lines', async function () {
    const actual = logs
    const expected = [
      [
        '[JUMPER]',
        'Cleaning and creating repos/ folder in',
        '/Users/beechj01/Local/jumper'
      ],
      [
        '[JUMPER]',
        'Cleaning and creating logs/ folder in',
        '/Users/beechj01/Local/jumper'
      ],
      [
        '[JUMPER]',
        'Running against:'
      ],
      [
        '  [0] connected-web/example\n  [1] connected-web/other-repo\n  [2] connected-web/final-example'
      ],
      [
        '[0]',
        'Starting some work:',
        'connected-web/example'
      ],
      [
        '[connected-web/example]',
        'echo "Hello connected-web/example"',
        'from',
        '/Users/beechj01/Local/jumper/repos/connected-web/example'
      ],
      [
        '[1]',
        'Starting some work:',
        'connected-web/other-repo'
      ],
      [
        '[connected-web/other-repo]',
        'echo "Hello connected-web/other-repo"',
        'from',
        '/Users/beechj01/Local/jumper/repos/connected-web/other-repo'
      ],
      [
        '[2]',
        'Starting some work:',
        'connected-web/final-example'
      ],
      [
        '[connected-web/final-example]',
        'echo "Hello connected-web/final-example"',
        'from',
        '/Users/beechj01/Local/jumper/repos/connected-web/final-example'
      ],
      [
        '[connected-web/example]',
        'Caught exception:',
        'Error: spawn /bin/sh ENOENT'
      ],
      [
        '[connected-web/example]',
        'Writing log file to ./logs/connected-web-example.log'
      ],
      [
        '[connected-web/other-repo]',
        'Caught exception:',
        'Error: spawn /bin/sh ENOENT'
      ],
      [
        '[connected-web/other-repo]',
        'Writing log file to ./logs/connected-web-other-repo.log'
      ],
      [
        '[connected-web/final-example]',
        'Caught exception:',
        'Error: spawn /bin/sh ENOENT'
      ],
      [
        '[connected-web/final-example]',
        'Writing log file to ./logs/connected-web-final-example.log'
      ],
      [
        '[0] connected-web/example',
        'Error: spawn /bin/sh ENOENT',
        'Completed OK'
      ],
      [
        '[1] connected-web/other-repo',
        'Error: spawn /bin/sh ENOENT',
        'Completed OK'
      ],
      [
        '[2] connected-web/final-example',
        'Error: spawn /bin/sh ENOENT',
        'Completed OK'
      ]
    ]
    expect(actual).to.deep.equal(expected)
  })
})
