import CoreACAuth from '../CoreACAuth'

class SlackAuth extends CoreACAuth {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get namespace () { return 'com.slack' }
  static get humanizedNamespace () { return 'Slack' }

  /* **************************************************************************/
  // Auth data
  /* **************************************************************************/

  get authToken () { return this.authData.access_token }
  get authTeamId () { return this.authData.team_id }
  get authTeamName () { return this.authData.team_name }
  get authUserId () { return this.authData.user_id }
  get authUserName () { return this.authData.user_name }
  get authUrl () { return this.authData.url }

  /* **************************************************************************/
  // Properties: Identification
  /* **************************************************************************/

  get humanizedIdentifier () {
    return this.authUserName && this.authTeamName
      ? `${this.authTeamName} - ${this.authUserName}`
      : undefined
  }
}

export default SlackAuth
