import CoreGoogleMailService from './CoreGoogleMailService'

class GoogleMailService extends CoreGoogleMailService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreGoogleMailService.SERVICE_TYPES.GOOGLE_MAIL }

  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * @override
  */
  static createJS (...args) {
    return {
      ...super.createJS(...args),

      // This is default Google offers on new accounts. Historically the default
      // set by Wavebox is UNREAD. Keep this historic default in the model, but
      // new accounts should match what Google sets with DEFAULT.
      inboxType: this.INBOX_TYPES.GMAIL_DEFAULT
    }
  }

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

  get inboxType () {
    const val = this._value_('inboxType', undefined)
    if (val !== undefined) { return val }

    const depricatedVal = this._value_('unreadMode', undefined)
    if (depricatedVal !== undefined) {
      const convertedVal = this.constructor.depricatedUnreadModeToInboxType(depricatedVal)
      if (convertedVal) { return convertedVal }
    }

    return this.constructor.INBOX_TYPES.GMAIL_UNREAD
  }
  get supportedInboxTypes () {
    return new Set([
      this.constructor.INBOX_TYPES.GMAIL_DEFAULT,
      this.constructor.INBOX_TYPES.GMAIL_IMPORTANT,
      this.constructor.INBOX_TYPES.GMAIL_UNREAD,
      this.constructor.INBOX_TYPES.GMAIL_STARRED,
      this.constructor.INBOX_TYPES.GMAIL_PRIORITY,
      this.constructor.INBOX_TYPES.GMAIL_DEFAULT_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_IMPORTANT_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_UNREAD_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_STARRED_ATOM,
      this.constructor.INBOX_TYPES.GMAIL_PRIORITY_ATOM,
      this.constructor.INBOX_TYPES.GMAIL__ALL
    ])
  }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RESET_URL }
}

export default GoogleMailService
