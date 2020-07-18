const execSync = require('child_process').exec

const exec = (command, options) => {
  return new Promise(function (resolve, reject) {
    execSync(command, options, (error, stdout, stderr) => {
      if (error) {
        const errorString = [
          (stdout || '').trim(),
          (stderr || '').trim(),
          error
        ].filter(n => n).join(', ')
        reject(new Error(errorString))
      } else {
        resolve({
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim()
        })
      }
    })
  })
}

module.exports = exec
