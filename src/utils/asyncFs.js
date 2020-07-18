const fs = require('fs')
const { promisify } = require('util')

const read = promisify(fs.readFile)
const write = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)
const rename = promisify(fs.rename)

const report = (...messages) => console.log('[Async FS]', ...messages)

const exists = async (itemPath) => {
  try {
    await stat(itemPath)
    return true
  } catch (err) {
    return false
  }
}

const safeCreateDirectory = async (directoryPath) => {
  try {
    await mkdir(directoryPath, { recursive: true })
  } catch (err) {
    if (err && err.code === 'EEXIST') {
      report(`Directory: ${directoryPath} already exists`)
    } else {
      report(err)
    }
  }
}

const readJson = async (jsonFilePath) => {
  const jsonFile = await read(jsonFilePath, 'utf-8')
  return JSON.parse(jsonFile)
}

module.exports = {
  read,
  write,
  mkdir,
  exists,
  readJson,
  rename,
  safeCreateDirectory
}
