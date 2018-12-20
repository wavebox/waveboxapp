import CoreACServiceData from '../CoreACServiceData'

class SlackServiceData extends CoreACServiceData {
  /* **************************************************************************/
  // Slack service data
  /* **************************************************************************/

  get slackUnreadChannelInfo () { return this._value_('slackUnreadChannelInfo', {}) }
  get slackUnreadGroupInfo () { return this._value_('slackUnreadGroupInfo', {}) }
  get slackUnreadMPIMInfo () { return this._value_('slackUnreadMPIMInfo', {}) }
  get slackUnreadIMInfo () { return this._value_('slackUnreadIMInfo', {}) }
  get slackUnreadThreadInfo () { return this._value_('slackUnreadThreadInfo', {}) }

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
    const threadCount = this.slackUnreadThreadInfo.mention_count || 0

    return channelCount + groupCount + imCount + mpimCount + threadCount
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
    if (this.slackUnreadThreadInfo.has_unreads === true) { return true }

    return false
  }

  get trayMessages () {
    const channels = Object.keys(this.slackUnreadChannelInfo).reduce((acc, channelId) => {
      const chan = this.slackUnreadChannelInfo[channelId]
      if (this._isChannelAlive(chan) && chan.mention_count) {
        acc.push({
          id: channelId,
          text: `${chan.name} (${chan.mention_count})`,
          extended: {
            title: chan.name,
            subtitle: `${chan.mention_count} mention${chan.mention_count === 1 ? '' : 's'}`,
            optAvatarText: (chan.name || '')[0]
          },
          date: 0,
          data: {
            channelId: channelId,
            serviceId: this.parentId
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
          extended: {
            title: `@${im.name}`,
            subtitle: `${im.dm_count} message${im.dm_count === 1 ? '' : 's'}`,
            optAvatarText: (im.name || '')[0]
          },
          date: 0,
          data: {
            channelId: imId,
            serviceId: this.parentId
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
          extended: {
            title: `@${group.name}`,
            subtitle: `${group.mention_count} mention${group.mention_count === 1 ? '' : 's'}`,
            optAvatarText: (group.name || '')[0]
          },
          date: 0,
          data: {
            channelId: groupId,
            serviceId: this.parentId
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
          extended: {
            title: `@${formattedMembers}`,
            subtitle: `${mpim.unread_count} mention${mpim.unread_count === 1 ? '' : 's'}`,
            optAvatarText: '@'
          },
          date: 0,
          data: {
            channelId: mpimId,
            serviceId: this.parentId
          }
        })
      }
      return acc
    }, [])

    const threads = (this.slackUnreadThreadInfo.mention_count || 0) > 0 ? [{
      id: 'global_threads',
      text: `${this.slackUnreadThreadInfo.mention_count} unread thread${this.slackUnreadThreadInfo.mention_count === 1 ? '' : 's'}`,
      date: 0,
      data: {
        global: 'vall_threads',
        serviceId: this.parentId
      }
    }] : []

    return [].concat(threads, ims, mpims, channels, groups)
  }
}

export default SlackServiceData
