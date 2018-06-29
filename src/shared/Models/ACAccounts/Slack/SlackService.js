import CoreACService from '../CoreACService'

class SlackService extends CoreACService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return CoreACService.SERVICE_TYPES.SLACK }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Slack' }
  static get humanizedLogos () {
    return [
      'slack/logo_32px.png',
      'slack/logo_48px.png',
      'slack/logo_64px.png',
      'slack/logo_96px.png',
      'slack/logo_128px.png'
    ]
  }
  static get humanizedUnreadItemType () { return 'notification' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return true }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return true }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return true }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return 'com.slack' }

  /* **************************************************************************/
  // Properties: Display
  /* **************************************************************************/

  get serviceDisplayName () {
    const teamName = (this.teamOverview || {}).name || this.authTeamName
    const selfName = (this.selfOverview || {}).name

    if (teamName && selfName) {
      return `${teamName} @${selfName}`
    } else if (teamName) {
      return teamName
    } else {
      return this.humanizedType
    }
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get url () { return this._value_('authUrl') }
  get restoreLastUrl () { return false }

  /**
  * Gets the url being provided the service data if there is any customization to do
  * @param serviceData: the service data object
  * @return a url
  */
  getUrlWithData (serviceData) { return this.url }

  /* **************************************************************************/
  // Properties: Avatar
  /* **************************************************************************/

  get serviceAvatarURL () { return ((this.teamOverview || {}).icon || {}).image_230 }

  /* **************************************************************************/
  // Properties:  Behaviour
  /* **************************************************************************/

  /**
  * Looks to see if the input event should be prevented
  * @param input: the input info
  * @return true if the input should be prevented, false otherwise
  */
  shouldPreventInputEvent (input) {
    if (process.platform === 'darwin') {
      if (input.meta && input.shift && input.key === '<') { return true }
      if (input.meta && input.shift && input.key === '>') { return true }
    } else {
      if (input.control && input.shift && input.key === '<') { return true }
      if (input.control && input.shift && input.key === '>') { return true }
    }
    return false
  }

  /* **************************************************************************/
  // Properties: Slack
  /* **************************************************************************/

  get selfOverview () { return this._value_('selfOverview') }
  get hasSelfOverview () { return !!this.selfOverview }
  get teamOverview () { return this._value_('teamOverview') }
  get hasTeamOverview () { return !!this.teamOverview }
  get authTeamName () { return this._value_('authTeamName') }
}

export default SlackService
