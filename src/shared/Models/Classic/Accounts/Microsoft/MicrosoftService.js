const CoreService = require('../CoreService')

class MicrosoftService extends CoreService {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ACCESS_MODES () { return this.__metadata__.ACCESS_MODES }
  get accessMode () { return this.__metadata__.accessMode }

  /**
  * Looks to see if the input event should be prevented
  * @param input: the input info
  * @return true if the input should be prevented, false otherwise
  */
  shouldPreventInputEvent (input) {
    if (process.platform === 'darwin') {
      if (input.meta && input.shift && input.code && input.code.startsWith('Digit')) { return true }
      if (input.meta && input.code === 'KeyR') { return true }
    } else {
      if (input.control && input.shift && input.code && input.code.startsWith('Digit')) { return true }
      if (input.control && input.code === 'KeyR') { return true }
    }
    return false
  }
}

module.exports = MicrosoftService
