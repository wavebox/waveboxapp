import BaseAdaptor from './BaseAdaptor'
import { ExtensionLoader } from 'Browser'

class FastmailAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get matches () { return ['http(s)\\://(www.)fastmail.com(*)'] }
  static get guestApis () { return [ExtensionLoader.ENDPOINTS.FASTMAIL_WINDOW_OPEN] }
}

export default FastmailAdaptor
