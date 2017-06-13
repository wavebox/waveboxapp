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

  /* **************************************************************************/
  // Properties : Slack info
  /* **************************************************************************/

  get slackUnreadChannelInfo () { return this._value_('slackUnreadChannelInfo', {}) }
  get slackUnreadGroupInfo () { return this._value_('slackUnreadGroupInfo', {}) }
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
    if (group.is_muted === false) { return false }
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
      return this._isGroupAlive(grp) ? acc + grp.unread_count : acc
    }, 0)
    const imCount = Object.keys(this.slackUnreadIMInfo).reduce((acc, imId) => {
      const dm = this.slackUnreadIMInfo[imId]
      return this._isImAlive(dm) ? acc + dm.dm_count : acc
    }, 0)

    return channelCount + groupCount + imCount
  }

  get hasUnreadActivity () {
    const channelId = Object.keys(this.slackUnreadChannelInfo).find((channelId) => {
      const chan = this.slackUnreadChannelInfo[channelId]
      return this._isChannelAlive(chan) ? chan.unread_count !== 0 : false
    })
    if (channelId) { return true }
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
      if (this._isGroupAlive(group) && group.unread_count) {
        const formattedMembers = group.name.substring(5, group.name.length - 2).split('--').join(' @')
        acc.push({
          id: groupId,
          text: `@${formattedMembers} (${group.unread_count})`,
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

    return [].concat(ims, groups, channels)
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Gets the window open mode for a given url
  * @param url: the url to open with
  * @param parsedUrl: the url object parsed by nodejs url
  * @param disposition: the open mode disposition
  * @return the window open mode
  */
  getWindowOpenModeForUrl (url, parsedUrl, disposition) {
    const superMode = super.getWindowOpenModeForUrl(url, parsedUrl, disposition)
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
