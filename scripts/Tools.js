const { spawn } = require('child_process')
const fs = require('fs-extra')

/**
* Runs spawn as a promise
* @param cmd: the command to run
* @param args: the arguments to provide
* @param opts: the options for spawn
* @return promise
*/
const promiseSpawn = function (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const task = spawn(cmd, args, opts)
    task.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve()
      } else {
        reject(exitCode)
      }
    })
  })
}

/**
* Runs a set of spwan commands in sequence
* @param cmds: a list of commands, each with { cmd, args, opts, prelog, postlog, ignoreErrors }
* @return promise
*/
const sequencePromiseSpawn = function (cmds) {
  return cmds.reduce((acc, cmd) => {
    return acc
      .then(() => {
        if (cmd.prelog) { console.log(cmd.prelog) }
        return Promise.resolve()
      })
      .then(() => promiseSpawn(cmd.cmd, cmd.args, cmd.opts))
      .then(() => {
        if (cmd.postlog) { console.log(cmd.postlog) }
        return Promise.resolve()
      })
      .catch((err) => {
        if (cmd.ignoreErrors) {
          return Promise.resolve()
        } else {
          return Promise.reject(err)
        }
      })
  }, Promise.resolve())
}

/**
* Runs a set of remove commands in sequence
* @param cmds: a list of commands, each with { dir, prelog, postlog, ignoreErrors }
* @return promise
*/
const sequenceFsRemove = function (cmds) {
  return Promise.resolve()
    .then(() => {
      return cmds.reduce((acc, cmd) => {
        return acc
          .then(() => {
            if (cmd.prelog) { console.log(cmd.prelog) }
            return Promise.resolve()
          })
          .then(() => fs.remove(cmd.dir))
          .then(() => {
            if (cmd.postlog) { console.log(cmd.postlog) }
            return Promise.resolve()
          })
          .catch((err) => {
            if (cmd.ignoreErrors) {
              return Promise.resolve()
            } else {
              return Promise.reject(err)
            }
          })
      }, Promise.resolve())
    })
    .catch((e) => process.exit(-1))
}

module.exports = {
  promiseSpawn: promiseSpawn,
  sequencePromiseSpawn: sequencePromiseSpawn,
  sequenceFsRemove: sequenceFsRemove
}
