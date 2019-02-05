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

  get inboxType () {
    const val = this._value_('inboxType', undefined)
    if (val !== undefined) { return val }

    const depricatedVal = this._value_('unreadMode', undefined)
    if (depricatedVal !== undefined) {
      const convertedVal = this.constructor.depricatedUnreadModeToInboxType(depricatedVal)
      if (convertedVal) { return convertedVal }
    }

    return this.constructor.INBOX_TYPES.GINBOX_UNBUNDLED
  }
  get supportedInboxTypes () {
    return new Set([
      this.constructor.INBOX_TYPES.GMAIL_UNREAD,
      this.constructor.INBOX_TYPES.GMAIL__ALL,
      this.constructor.INBOX_TYPES.GINBOX_UNBUNDLED
    ])
  }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RELOAD }

  /* **************************************************************************/
  // Properties: Deprication
  /* **************************************************************************/

  get ginboxSeenRetirementVersion () { return this._value_('ginboxSeenRetirementVersion', 0) }
}

export default GoogleInboxService
