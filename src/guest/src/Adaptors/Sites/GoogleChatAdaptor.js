import BaseAdaptor from './BaseAdaptor'
import { ExtensionLoader } from 'Browser'

class GoogleChatAdaptor extends BaseAdaptor {
  /* **************************************************************************/
  // Class properties
  /* **************************************************************************/

  static get matches () { return ['http(s)\\://chat.google.com(/*)'] }
  static get guestApis () { return [ExtensionLoader.ENDPOINTS.GOOGLE_CHAT_WINDOW_OPEN] }
}

export default GoogleChatAdaptor
