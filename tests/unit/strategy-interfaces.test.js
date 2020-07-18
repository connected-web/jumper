/* eslint-env mocha */
const { expect } = require('chai')

const strategies = require('../../src/strategies/index')

describe('Strategies', function () {
  Object.values(strategies).forEach(function (strategy) {
    describe(`The ${strategy.name}`, function () {
      let steps

      before(function () {
        steps = strategy('exampleRepo', './', 'ownership')
      })

      it('returns steps when called with params', function () {
        expect(steps.length).to.not.equal(0)
      })

      it('has steps objects each containing a command', function () {
        let commandNotFound = false
        steps.forEach(function (step) {
          if (!step.command) {
            commandNotFound = true
          }
        })
        expect(commandNotFound).to.equal(false)
      })

      it('has steps objects each containing the current working directory', function () {
        let cwdNotFound = false
        steps.forEach(function (step) {
          if (!step.cwd) {
            cwdNotFound = true
          }
        })
        expect(cwdNotFound).to.equal(false)
      })
    })
  })
})
