import MicrosoftService from './MicrosoftService'

const UNREAD_MODES = Object.freeze({
  INBOX_UNREAD: 'INBOX_UNREAD',
  INBOX_FOCUSED_UNREAD: 'INBOX_FOCUSED_UNREAD'
})

class MicrosoftMailService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_MAIL }
  static get UNREAD_MODES () { return UNREAD_MODES }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Outlook' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_mail_32px.png',
      'microsoft/logo_mail_48px.png',
      'microsoft/logo_mail_64px.png',
      'microsoft/logo_mail_96px.png',
      'microsoft/logo_mail_128px.png'
    ]
  }
  static get humanizedColor () { return '#0078d7' }

  /* **************************************************************************/
  // Properties: Sync
  /* **************************************************************************/

  get syncWatchFields () {
    return [
      'unreadMode'
    ]
  }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return true }
  get supportsNativeNotifications () { return true }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return true }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return 'com.microsoft' }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get personalUrl () { return 'https://outlook.live.com/owa/?authRedirect=true&nlp=1' }
  get corporateUrl () { return 'https://outlook.office365.com/owa/?authRedirect=true&nlp=1' }

  /* **************************************************************************/
  // Properties : Messages & unread info
  /* **************************************************************************/

  get unreadMode () { return this._value_('unreadMode', UNREAD_MODES.INBOX_UNREAD) }
  get email () { return this._value_('email') }
  get userFullName () { return this._value_('userFullName') }
  get userId () { return this._value_('userId') }
  get serviceDisplayName () { return this.email || this.userFullName }
}

export default MicrosoftMailService
