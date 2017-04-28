const path = require('path')
const pkg = require('../../package.json')
const fs = require('fs-extra')
const AppDirectory = require('appdirectory')

class AppUpdaterLog {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.logPath = path.join(new AppDirectory({ appName: pkg.name, useRoaming: true }).userData(), 'squirrel_log.txt')
    this.items = []
  }

  /* ****************************************************************************/
  // Logging
  /* ****************************************************************************/

  /**
  * Saves an item to the log
  * @param str: the log to write
  * @return this
  */
  log (str) {
    this.items.push(`[${new Date().toString()}]: ${str}`)
    return this
  }

  /**
  * Same as log, but returns a synchronous resolved promise
  * @return promise
  */
  promiseLog (str) {
    this.log(str)
    return Promise.resolve()
  }

  /**
  * Flushes the current log to disk in a synchronous way
  * @return this
  */
  flush () {
    const logStr = '\r\n' + this.items.join('\r\n')
    fs.appendFileSync(this.logPath, logStr, 'utf8')
    this.items = []
    return this
  }
}

module.exports = AppUpdaterLog
