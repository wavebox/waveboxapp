const CoreMailbox = require('../CoreMailbox')
const ServiceFactory = require('../ServiceFactory')
const MailboxColors = require('../MailboxColors')

class SlackMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.SLACK }

  static get humanizedLogos () {
    return [
      'slack/logo_32px.png',
      'slack/logo_48px.png',
      'slack/logo_64px.png',
      'slack/logo_96px.png',
      'slack/logo_128px.png',
      'slack/logo_600px.png'
    ]
  }
  static get humanizedVectorLogo () { return 'slack/logo_vector.svg' }
  static get humanizedType () { return 'Slack' }
  static get defaultColor () { return MailboxColors.SLACK }
  static get excludedExportKeys () {
    return super.excludedExportKeys.concat(['auth'])
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @override
  */
  modelizeService (serviceData) {
    return ServiceFactory.modelize(
      this.id,
      this.type,
      serviceData,
      { authUrl: this.authUrl, teamName: this.authTeamName },
      this.buildMailboxToServiceMigrationData(serviceData.type))
  }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get auth () { return this._value_('auth', {}) }
  get hasAuth () { return Object.keys(this.auth).length !== 0 }
  get supportsAuth () { return true }
  get authToken () { return this.auth.access_token }
  get authTeamId () { return this.auth.team_id }
  get authTeamName () { return this.auth.team_name }
  get authUserId () { return this.auth.user_id }
  get authUserName () { return this.auth.user_name }
  get authUrl () { return this.auth.url }

  get isAuthenticationInvalid () { return this.auth.isInvalid }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get selfOverview () { return this.__data__.selfOverview }
  get hasSelfOverview () { return !!this.selfOverview }
  get teamOverview () { return this.__data__.teamOverview }
  get hasTeamOverview () { return !!this.teamOverview }
  get displayName () {
    const teamName = (this.teamOverview || {}).name || this.authTeamName
    const selfName = (this.selfOverview || {}).name

    if (teamName && selfName) {
      return `${teamName} @${selfName}`
    } else if (teamName) {
      return teamName
    } else {
      return super.displayName
    }
  }
  get avatarURL () { return ((this.teamOverview || {}).icon || {}).image_230 }
}

module.exports = SlackMailbox
