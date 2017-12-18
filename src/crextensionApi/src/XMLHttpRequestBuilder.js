import { CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX } from 'shared/extensionApis'

/**
* Builds a new XMLHTTPRequest
* @param extensionId: the id of the extension
* @param xhrToken: the content script token to use
* @param SuperClass: the parent class to inherit from
*/
const buildContentScriptXMLHttpRequest = function (extensionId, xhrToken, SuperClass) {
  class XMLHttpRequest extends SuperClass {
    /* **************************************************************************/
    // Lifecycle
    /* **************************************************************************/

    constructor () {
      super()
      this.withCredentials = true
    }

    /* **************************************************************************/
    // Starting
    /* **************************************************************************/

    send (...args) {
      super.setRequestHeader('Accept', `${CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX}${extensionId}/${xhrToken}`)
      return super.send(...args)
    }
  }

  return XMLHttpRequest
}

export default {
  buildContentScriptXMLHttpRequest
}
