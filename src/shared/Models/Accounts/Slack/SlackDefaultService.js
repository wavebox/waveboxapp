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
  // Properties : Provider Details & counts etc
  /* **************************************************************************/

  get unreadCount () {
    const channelCount = Object.keys(this.slackUnreadChannelInfo).reduce((acc, channelId) => {
      return acc + this.slackUnreadChannelInfo[channelId].mention_count
    }, 0)
    const groupCount = Object.keys(this.slackUnreadGroupInfo).reduce((acc, groupId) => {
      return acc + this.slackUnreadGroupInfo[groupId].unread_count
    }, 0)
    const imCount = Object.keys(this.slackUnreadIMInfo).reduce((acc, imId) => {
      return acc + this.slackUnreadIMInfo[imId].dm_count
    }, 0)

    return channelCount + groupCount + imCount
  }

  get hasOtherUnread () {
    const channelId = Object.keys(this.slackUnreadChannelInfo).find((channelId) => {
      return this.slackUnreadChannelInfo[channelId].unread_count !== 0
    })
    if (channelId) { return true }
    return false
  }

  get trayMessages () {
    const channels = Object.keys(this.slackUnreadChannelInfo).reduce((acc, channelId) => {
      const channel = this.slackUnreadChannelInfo[channelId]
      if (channel.mention_count) {
        acc.push({
          id: channelId,
          text: `${channel.name} (${channel.mention_count})`,
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
      if (im.dm_count) {
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
      if (group.unread_count) {
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
}

module.exports = SlackDefaultService
