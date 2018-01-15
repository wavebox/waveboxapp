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

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get url () { return 'https://teams.microsoft.com' }
}

module.exports = MicrosoftTeamService
