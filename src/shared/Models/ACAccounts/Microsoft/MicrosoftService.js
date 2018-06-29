import CoreACService from '../CoreACService'
import SubclassNotImplementedError from '../SubclassNotImplementedError'

const ACCESS_MODES = Object.freeze({
  OUTLOOK: 'OUTLOOK',
  OFFICE365: 'OFFICE365'
})

class MicrosoftService extends CoreACService {
  /* **************************************************************************/
  // Class: Types
  /* **************************************************************************/

  static get ACCESS_MODES () { return ACCESS_MODES }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return this.outlookUrl }
  get outlookUrl () { throw SubclassNotImplementedError }
  get o365Url () { throw SubclassNotImplementedError }
  get restoreLastUrl () { return false }

  /**
  * @override
  */
  getUrlWithData (serviceData, authData) {
    if (authData) {
      if (authData.accessMode === this.constructor.ACCESS_MODES.OFFICE365) {
        return this.o365Url
      } else if (authData.accessMode === this.constructor.ACCESS_MODES.OUTLOOK) {
        return this.outlookUrl
      }
    }

    return this.url
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

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

export default MicrosoftService
