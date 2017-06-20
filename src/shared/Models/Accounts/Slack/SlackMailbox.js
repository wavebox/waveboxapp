const CoreMailbox = require('../CoreMailbox')
const ServiceFactory = require('../ServiceFactory')
const SlackDefaultService = require('./SlackDefaultService')
const MailboxColors = require('../MailboxColors')

class SlackMailbox extends CoreMailbox {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreMailbox.MAILBOX_TYPES.SLACK }

  static get humanizedLogos () {
    return [
      'images/slack/logo_32px.png',
      'images/slack/logo_48px.png',
      'images/slack/logo_64px.png',
      'images/slack/logo_128px.png',
      'images/slack/logo_600px.png'
    ]
  }
  static get humanizedVectorLogo () { return 'images/slack/logo_vector.svg' }
  static get humanizedType () { return 'Slack' }
  static get humanizedUnreadItemType () { return 'notification' }
  static get supportsUnreadActivity () { return true }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @override
  */
  modelizeService (serviceData) {
    return ServiceFactory.modelize(this.id, this.type, serviceData, {
      authUrl: this.authUrl,
      teamName: this.authTeamName
    })
  }

  /**
  * Modifies raw mailbox json for export
  * @param id: the id of the mailbox
  * @param mailboxJS: the js mailbox object
  * @return the modified data
  */
  static prepareForExport (id, mailboxJS) {
    const prep = super.prepareForExport(id, mailboxJS)
    const clearKeys = ['auth']
    clearKeys.forEach((k) => {
      delete prep[k]
    })
    return prep
  }

  /* **************************************************************************/
  // Properties : Display
  /* **************************************************************************/

  get color () { return super.color || MailboxColors.SLACK }

  /* **************************************************************************/
  // Properties : Authentication
  /* **************************************************************************/

  get auth () { return this._value_('auth', {}) }
  get hasAuth () { return Object.keys(this.auth).length !== 0 }
  get authToken () { return this.auth.access_token }
  get authTeamId () { return this.auth.team_id }
  get authTeamName () { return this.auth.team_name }
  get authUserId () { return this.auth.user_id }
  get authUserName () { return this.auth.user_name }
  get authUrl () { return this.auth.url }

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
  get unreadCount () { return this.serviceForType(SlackDefaultService.type).unreadCount }
  get hasUnreadActivity () { return this.serviceForType(SlackDefaultService.type).hasUnreadActivity }
  get trayMessages () { return this.serviceForType(SlackDefaultService.type).trayMessages }
}

module.exports = SlackMailbox
