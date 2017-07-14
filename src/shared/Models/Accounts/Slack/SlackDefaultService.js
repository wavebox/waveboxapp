const CoreService = require('../CoreService')

class SlackDefaultService extends CoreService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get type () { return CoreService.SERVICE_TYPES.DEFAULT }
  static get humanizedType () { return 'Slack' }
  static get humanizedLogos () {
    return [
      'images/slack/logo_32px.png',
      'images/slack/logo_48px.png',
      'images/slack/logo_64px.png',
      'images/slack/logo_128px.png'
    ]
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get teamName () { return this.__metadata__.teamName }
  get url () { return this.__metadata__.authUrl }
  get sleepable () { return this._value_('sleepable', false) }
  get reloadBehaviour () { return this.constructor.RELOAD_BEHAVIOURS.RESET_URL }

  /* **************************************************************************/
  // Properties : Slack info
  /* **************************************************************************/

  get slackUnreadChannelInfo () { return this._value_('slackUnreadChannelInfo', {}) }
  get slackUnreadGroupInfo () { return this._value_('slackUnreadGroupInfo', {}) }
  get slackUnreadMPIMInfo () { return this._value_('slackUnreadMPIMInfo', {}) }
  get slackUnreadIMInfo () { return this._value_('slackUnreadIMInfo', {}) }

  /* **************************************************************************/
  // Content utils
  /* **************************************************************************/

  /**
  * @param channel: the channel to test
  * @return true if this channel is applicable for this user (i.e. not muted, archived etc)
  */
  _isChannelAlive (channel) {
    if (channel.is_archived === true) { return false }
    if (channel.is_muted === true) { return false }
    if (channel.is_member === false) { return false }
    return true
  }

  /**
  * @param group: the group to test
  * @return true if this group is applicable for this user (i.e. not muted, archived etc)
  */
  _isGroupAlive (group) {
    if (group.is_archived === true) { return false }
    if (group.is_muted === true) { return false }
    return true
  }

  /**
  * @param mpim: the mpim to test
  * @return true if this mpim is applicable for this user (i.e. not muted, archived etc)
  */
  _isMPIMAlive (mpim) {
    if (mpim.is_archived === true) { return false }
    if (mpim.is_muted === true) { return false }
    return true
  }

  /**
  * @param im: the im to test
  * @return true if this IM is applicable for this user (i.e. not muted, archived etc)
  */
  _isImAlive (im) {
    return true
  }

  /* **************************************************************************/
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get unreadCount () {
    const channelCount = Object.keys(this.slackUnreadChannelInfo).reduce((acc, channelId) => {
      const chan = this.slackUnreadChannelInfo[channelId]
      return this._isChannelAlive(chan) ? acc + chan.mention_count : acc
    }, 0)
    const groupCount = Object.keys(this.slackUnreadGroupInfo).reduce((acc, groupId) => {
      const grp = this.slackUnreadGroupInfo[groupId]
      return this._isGroupAlive(grp) ? acc + grp.mention_count : acc
    }, 0)
    const mpimCount = Object.keys(this.slackUnreadMPIMInfo).reduce((acc, mpimId) => {
      const mpim = this.slackUnreadMPIMInfo[mpimId]
      return this._isMPIMAlive(mpim) ? acc + mpim.unread_count : acc
    }, 0)
    const imCount = Object.keys(this.slackUnreadIMInfo).reduce((acc, imId) => {
      const dm = this.slackUnreadIMInfo[imId]
      return this._isImAlive(dm) ? acc + dm.dm_count : acc
    }, 0)

    return channelCount + groupCount + imCount + mpimCount
  }

  get hasUnreadActivity () {
    const channelId = Object.keys(this.slackUnreadChannelInfo).find((channelId) => {
      const chan = this.slackUnreadChannelInfo[channelId]
      return this._isChannelAlive(chan) && chan.has_unreads
    })
    if (channelId) { return true }
    const groupId = Object.keys(this.slackUnreadGroupInfo).find((groupId) => {
      const group = this.slackUnreadGroupInfo[groupId]
      return this._isGroupAlive(group) && group.has_unreads
    })
    if (groupId) { return true }

    return false
  }

  get trayMessages () {
    const channels = Object.keys(this.slackUnreadChannelInfo).reduce((acc, channelId) => {
      const chan = this.slackUnreadChannelInfo[channelId]
      if (this._isChannelAlive(chan) && chan.mention_count) {
        acc.push({
          id: channelId,
          text: `${chan.name} (${chan.mention_count})`,
          date: 0,
          data: {
            channelId: channelId,
            mailboxId: this.parentId,
            serviceType: this.type
          }
        })
      }
      return acc
    }, [])
    const ims = Object.keys(this.slackUnreadIMInfo).reduce((acc, imId) => {
      const im = this.slackUnreadIMInfo[imId]
      if (this._isImAlive(im) && im.dm_count) {
        acc.push({
          id: imId,
          text: `@${im.name} (${im.dm_count})`,
          date: 0,
          data: {
            channelId: imId,
            mailboxId: this.parentId,
            serviceType: this.type
          }
        })
      }
      return acc
    }, [])
    const groups = Object.keys(this.slackUnreadGroupInfo).reduce((acc, groupId) => {
      const group = this.slackUnreadGroupInfo[groupId]
      if (this._isGroupAlive(group) && group.mention_count) {
        acc.push({
          id: groupId,
          text: `@${group.name} (${group.mention_count})`,
          date: 0,
          data: {
            channelId: groupId,
            mailboxId: this.parentId,
            serviceType: this.type
          }
        })
      }
      return acc
    }, [])
    const mpims = Object.keys(this.slackUnreadMPIMInfo).reduce((acc, mpimId) => {
      const mpim = this.slackUnreadMPIMInfo[mpimId]
      if (this._isMPIMAlive(mpim) && mpim.unread_count) {
        const formattedMembers = mpim.name.substring(5, mpim.name.length - 2).split('--').join(' @')
        acc.push({
          id: mpimId,
          text: `@${formattedMembers} (${mpim.unread_count})`,
          date: 0,
          data: {
            channelId: mpimId,
            mailboxId: this.parentId,
            serviceType: this.type
          }
        })
      }
      return acc
    }, [])

    return [].concat(ims, mpims, channels, groups)
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @param provisionalTargetUrl: the provisional target url that the user may be hovering over or have highlighted
  * @param parsedProvisionalTargetUrl: the provisional target parsed by nodejs url
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl) {
    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition, provisionalTargetUrl, parsedProvisionalTargetUrl)
    if (superMode !== this.constructor.WINDOW_OPEN_MODES.DEFAULT) { return superMode }

    if (parsedUrl.hostname === 'files.slack.com') {
      // You would think download but this doesn't work
      return this.constructor.WINDOW_OPEN_MODES.CONTENT
    } else if (parsedUrl.hostname.endsWith('.slack.com') && parsedUrl.pathname.startsWith('/call/')) {
      return this.constructor.WINDOW_OPEN_MODES.CONTENT
    } else {
      return this.constructor.WINDOW_OPEN_MODES.EXTERNAL
    }
  }
}

module.exports = SlackDefaultService
