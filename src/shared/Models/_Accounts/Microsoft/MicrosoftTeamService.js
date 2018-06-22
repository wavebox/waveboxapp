const MicrosoftService = require('./MicrosoftService')

class MicrosoftTeamService extends MicrosoftService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.TEAM }
  static get humanizedType () { return 'Teams' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_team_32px.png',
      'microsoft/logo_team_48px.png',
      'microsoft/logo_team_64px.png',
      'microsoft/logo_team_96px.png',
      'microsoft/logo_team_128px.png'
    ]
  }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat([
      'unreadCount',
      'unreadCountUpdateTime'
    ])
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://teams.microsoft.com' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadCount () { return true }
  get supportsNativeNotifications () { return true }
  get supportsTrayMessages () { return true }

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

module.exports = MicrosoftTeamService
