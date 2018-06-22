import MicrosoftService from './MicrosoftService'

class MicrosoftTeamsService extends MicrosoftService {
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

  /* **************************************************************************/
  // Properties: Humanized
  /* **************************************************************************/

  get humanizedType () { return 'Microsoft Teams' }
  get humanizedTypeShort () { return 'Teams' }
  get humanizedLogos () {
    return [
      'microsoft/logo_team_32px.png',
      'microsoft/logo_team_48px.png',
      'microsoft/logo_team_64px.png',
      'microsoft/logo_team_96px.png',
      'microsoft/logo_team_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties: Behaviour
  /* **************************************************************************/

  get outlookUrl () { return this.url }
  get o365Url () { return this.url }
  get url () { return 'https://teams.microsoft.com' }
}

export default MicrosoftTeamsService
