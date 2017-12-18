const GoogleService = require('./GoogleService')

class GoogleCommunicationService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.COMMUNICATION }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Hangouts' }
  static get humanizedTypeShort () { return 'Hangouts' }
  static get humanizedUnreadItemType () { return 'message' }
  static get humanizedLogos () {
    return [
      'google/logo_hangouts_32px.png',
      'google/logo_hangouts_48px.png',
      'google/logo_hangouts_64px.png',
      'google/logo_hangouts_96px.png',
      'google/logo_hangouts_128px.png'
    ]
  }

  /* **************************************************************************/
  // Class: Support
  /* **************************************************************************/

  static get supportsUnreadCount () { return true }
  static get supportsNativeNotifications () { return true }
  static get supportsTrayMessages () { return true }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://hangouts.google.com' }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get unreadCount () { return this._value_('unreadCount', 0) }
  get unreadCountUpdateTime () { return this._value_('unreadCountUpdateTime', 0) }
  get trayMessages () {
    const count = this.unreadCount
    return count === 0 ? [] : [
      {
        id: `auto_${count}`,
        text: `${count} unseen ${this.humanizedTypeShort} ${this.humanizedUnreadItemType}${count > 1 ? 's' : ''}`,
        date: this.unreadCountUpdateTime,
        data: {}
      }
    ]
  }
}

module.exports = GoogleCommunicationService
