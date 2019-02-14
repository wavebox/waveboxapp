import BaseAdaptor from './BaseAdaptor'
import { ExtensionLoader } from 'Browser'

class SkypeAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get matches () { return ['http(s)\\://(preview.)web.skype.com(/*)'] }
  static get guestApis () { return [ExtensionLoader.ENDPOINTS.SKYPE_WINDOW_OPEN] }
}

export default SkypeAdaptor
