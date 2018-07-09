import CoreGoogleMailService from './CoreGoogleMailService'

class GoogleMailService extends CoreGoogleMailService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreGoogleMailService.SERVICE_TYPES.GOOGLE_MAIL }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Gmail' }
  static get humanizedTypeShort () { return 'Gmail' }
  static get humanizedLogos () {
    return [
      'google/logo_gmail_32px.png',
      'google/logo_gmail_48px.png',
      'google/logo_gmail_64px.png',
      'google/logo_gmail_96px.png',
      'google/logo_gmail_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(220, 75, 75)' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return 'https://mail.google.com?ibxr=0' }

  /* **************************************************************************/
  // Properties: Mail
  /* **************************************************************************/

  get unreadMode () { return this._value_('unreadMode', this.constructor.UNREAD_MODES.INBOX_UNREAD) }
  get supportedUnreadModes () {
    return new Set([
      this.constructor.UNREAD_MODES.INBOX_ALL,
      this.constructor.UNREAD_MODES.INBOX_UNREAD,
      this.constructor.UNREAD_MODES.INBOX_UNREAD_IMPORTANT,
      this.constructor.UNREAD_MODES.INBOX_UNREAD_PERSONAL,
      this.constructor.UNREAD_MODES.INBOX_UNREAD_ATOM,
      this.constructor.UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM,
      this.constructor.UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM
    ])
  }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RESET_URL }
}

export default GoogleMailService
