const DebugFlags = require('./DebugFlags')

class Debug {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.flags = new DebugFlags()
  }

  /**
  * Loads the debugger config into the window
  */
  load () {
    window.waveboxDebug = {
      flags: {}
    }
  }

  /* **************************************************************************/
  // Logging helpers
  /* **************************************************************************/

  /**
  * Sends a log if the flag matches
  * @param key: the key of the flag (not the un-got key, the safe key from DebugFlags)
  * @param args: either the value to log, or an array of values to pass to console.log
  * @param value=true: the true state of the flag that indicates a log
  */
  flagLog (key, args, value = true) {
    if (this.flags[key] === value) {
      args = Array.isArray(args) ? args : [args]
      console.log.apply(this, args)
    }
  }
}

module.exports = new Debug()
