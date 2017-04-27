import DebugFlags from './DebugFlags'
import DebugTests from './DebugTests'

class Debug {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.flags = new DebugFlags()
    this.tests = new DebugTests()
  }

  /**
  * Loads the debugger config into the window
  */
  load () {
    window.waveboxDebug = {
      flags: {},
      tests: this.tests
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

export default new Debug()
