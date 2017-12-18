import { ELEVATED_LOG_PREFIX } from 'shared/constants'

class ELConsole {
  /**
  * Logs the supplied arguments and also logs them to the parent frame
  * @param message: the message to send
  */
  log (message) {
    console.log(`${ELEVATED_LOG_PREFIX}${message}`)
  }

  /**
  * Logs the supplied arguments as errors and also logs them to the parent frame
  * @param message: the message to send
  */
  error (message) {
    console.error(`${ELEVATED_LOG_PREFIX}${message}`)
  }
}

export default new ELConsole()
