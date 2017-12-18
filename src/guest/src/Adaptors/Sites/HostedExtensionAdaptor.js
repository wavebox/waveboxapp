import BaseAdaptor from './BaseAdaptor'
import { webFrame } from 'electron'
import { WAVEBOX_HOSTED_EXTENSION_PROTOCOL } from 'shared/extensionApis'

class HostedExtensionAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      `${WAVEBOX_HOSTED_EXTENSION_PROTOCOL}\\://*`
    ]
  }
  static get hasJS () { return true }

  /* **************************************************************************/
  // JS
  /* **************************************************************************/

  executeJS () {
    webFrame.registerURLSchemeAsPrivileged(WAVEBOX_HOSTED_EXTENSION_PROTOCOL)
  }
}

export default HostedExtensionAdaptor
