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

/**
* Builds a new XMLHTTPRequest
* @param extensionId: the id of the extension
* @param xhrToken: the content script token to use
* @param superFn: the parent function to use
*/
const buildContentScriptFetch = function (extensionId, xhrToken, superFn) {
  return function (url, rawOptions) {
    const acceptHeader = `${CR_CONTENT_SCRIPT_XHR_ACCEPT_PREFIX}${extensionId}/${xhrToken}`
    const options = {
      ...rawOptions,
      credentials: (rawOptions || {}).credentials || 'include',
      headers: {
        ...(rawOptions ? rawOptions.headers : undefined),
        'Accept': ((rawOptions || {}).headers || {}).Accept
          ? `${acceptHeader}, ${rawOptions.headers.Accept}`
          : acceptHeader
      }
    }
    return superFn(url, options)
  }
}

/**
* Builds a new XMLHTTPRequest
* @param SuperClass: the parent class to inherit from
*/
const buildHostedXMLHttpRequest = function (SuperClass) {
  class XMLHttpRequest extends SuperClass {
    /* **************************************************************************/
    // Lifecycle
    /* **************************************************************************/

    constructor () {
      super()
      this.withCredentials = true
    }
  }

  return XMLHttpRequest
}

/**
* Builds a new XMLHTTPRequest
* @param superFn: the parent function to use
*/
const buildHostedFetch = function (superFn) {
  return function (url, rawOptions) {
    const options = {
      ...rawOptions,
      credentials: rawOptions.credentials || 'include'
    }
    return superFn(url, options)
  }
}

export default {
  buildContentScriptXMLHttpRequest,
  buildContentScriptFetch,
  buildHostedXMLHttpRequest,
  buildHostedFetch
}
