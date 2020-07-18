function slug (word) {
  return word.toLowerCase()
    .replace(/[.']/g, '')
    .replace(/[^a-z\d-]/g, ' ')
    .trim()
    .replace(/(\s)+/g, '-')
}

module.exports = slug