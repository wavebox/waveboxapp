import CoreACService from '../CoreACService'
import SubclassNotImplementedError from '../SubclassNotImplementedError'

class MicrosoftService extends CoreACService {
  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return this.personalUrl }
  get personalUrl () { SubclassNotImplementedError('MicrosoftService.personalUrl') }
  get corporateUrl () { SubclassNotImplementedError('MicrosoftService.corporateUrl') }
  get restoreLastUrl () { return false }

  /**
  * @override
  */
  getUrlWithData (serviceData, authData) {
    if (authData) {
      if (authData.isPersonalAccount) {
        return this.personalUrl
      } else {
        return this.corporateUrl
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
