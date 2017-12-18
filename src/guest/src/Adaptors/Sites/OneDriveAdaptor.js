import BaseAdaptor from './BaseAdaptor'
import { ExtensionLoader } from 'Browser'

class OneDriveAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () {
    return [
      'http(s)\\://onedrive.live.com(*)',
      'http(s)\\://*.sharepoint.com(*)'
    ]
  }
  static get guestApis () { return [ExtensionLoader.ENDPOINTS.ONEDRIVE_WINDOW_OPEN] }
}

export default OneDriveAdaptor
