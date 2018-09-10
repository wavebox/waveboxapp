import MicrosoftService from './MicrosoftService'

class MicrosoftTeamsService extends MicrosoftService {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get type () { return MicrosoftService.SERVICE_TYPES.MICROSOFT_TEAMS }

  /* **************************************************************************/
  // Class: Humanized
  /* **************************************************************************/

  static get humanizedType () { return 'Microsoft Teams' }
  static get humanizedTypeShort () { return 'Teams' }
  static get humanizedLogos () {
    return [
      'microsoft/logo_team_32px.png',
      'microsoft/logo_team_48px.png',
      'microsoft/logo_team_64px.png',
      'microsoft/logo_team_96px.png',
      'microsoft/logo_team_128px.png'
    ]
  }
  static get humanizedColor () { return 'rgb(84, 85, 177)' }

  /* **************************************************************************/
  // Properties: Support
  /* **************************************************************************/

  get supportsUnreadActivity () { return false }
  get supportsUnreadCount () { return true }
  get supportsTrayMessages () { return true }
  get supportsSyncedDiffNotifications () { return false }
  get supportsNativeNotifications () { return true }
  get supportsGuestNotifications () { return false }
  get supportsSyncWhenSleeping () { return false }
  get supportsWBGAPI () { return false }
  get supportedAuthNamespace () { return undefined }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get personalUrl () { return this.url }
  get corporateUrl () { return this.url }
  get url () { return 'https://teams.microsoft.com' }
}

export default MicrosoftTeamsService
