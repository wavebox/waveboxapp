const GoogleService = require('./GoogleService')

class GoogleTeamService extends GoogleService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return GoogleService.SERVICE_TYPES.TEAM }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'hasUnreadActivity'
    ])
  }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Google Chat' }
  static get humanizedTypeShort () { return 'Chat' }
  static get humanizedLogos () {
    return [
      'google/logo_chat_32px.png',
      'google/logo_chat_48px.png',
      'google/logo_chat_64px.png',
      'google/logo_chat_96px.png',
      'google/logo_chat_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://chat.google.com' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsGuestNotifications () { return true }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get hasUnreadActivity () { return this._value_('hasUnreadActivity', false) }
}

module.exports = GoogleTeamService
