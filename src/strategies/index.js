const strategies = {
  aoc: require('./aoc.strategy'),
  audit: require('./audit.strategy'),
  checkout: require('./checkout.strategy'),
  hello: require('./hello.strategy'),
  linting: require('./linting.strategy'),
  'pr-checker': require('./pr-checker.strategy'),
  rebuild: require('./rebuild.strategy')
}

module.exports = strategies
