import CoreGoogleMailService from './CoreGoogleMailService'

class GoogleInboxService extends CoreGoogleMailService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreGoogleMailService.SERVICE_TYPES.GOOGLE_INBOX }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Inbox' }
  static get humanizedTypeShort () { return 'Inbox' }
  static get humanizedLogos () {
    return [
      'google/logo_ginbox_32px.png',
      'google/logo_ginbox_48px.png',
      'google/logo_ginbox_64px.png',
      'google/logo_ginbox_96px.png',
      'google/logo_ginbox_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(66, 133, 244)' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://inbox.google.com' }

  /* **************************************************************************/
  // Properties: Mail
  /* **************************************************************************/

  get unreadMode () { return this._value_('unreadMode', this.constructor.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED) }
  get supportedUnreadModes () {
    return new Set([
      this.constructor.UNREAD_MODES.INBOX_ALL,
      this.constructor.UNREAD_MODES.INBOX_UNREAD,
      this.constructor.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED
    ])
  }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RELOAD }
}

export default GoogleInboxService
