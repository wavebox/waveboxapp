import ServiceReducer from './ServiceReducer'

class SlackDefaultServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Full unread
  /* **************************************************************************/

  /**
  * Sets the unread info
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param unreadInfo: the unread info from the slack api channels: the channels to set
  */
  static setSlackUnreadInfo (mailbox, service, unreadInfo) {
    return service.changeData({
      slackUnreadChannelInfo: unreadInfo.channels.reduce((acc, channel) => {
        acc[channel.id] = {
          id: channel.id,
          name: channel.name,
          is_archived: channel.is_archived,
          is_muted: channel.is_muted,
          is_member: channel.is_member,
          mention_count: channel.mention_count_display,
          unread_count: channel.unread_count_display
        }
        return acc
      }, {}),
      slackUnreadGroupInfo: unreadInfo.groups.reduce((acc, group) => {
        acc[group.id] = {
          id: group.id,
          name: group.name,
          is_archived: group.is_archived,
          is_muted: group.is_muted,
          mention_count: group.mention_count_display,
          unread_count: group.unread_count_display
        }
        return acc
      }, {}),
      slackUnreadIMInfo: unreadInfo.ims.reduce((acc, im) => {
        acc[im.id] = {
          id: im.id,
          name: im.name,
          user_id: im.user_id,
          dm_count: im.dm_count
        }
        return acc
      }, {})
    })
  }

  /* **************************************************************************/
  // Unread: marked
  /* **************************************************************************/

  /**
  * Handles the RTM indicating the channel has been marked by the user
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm channel
  */
  static rtmChannelMarked (mailbox, service, rtmEvent) {
    if (service.slackUnreadChannelInfo[rtmEvent.channel]) {
      return service.changeDataWithChangeset({
        slackUnreadChannelInfo: {
          [rtmEvent.channel]: {
            mention_count: rtmEvent.mention_count_display,
            unread_count: rtmEvent.unread_count_display
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating the group has been marked by the user
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm group
  */
  static rtmGroupMarked (mailbox, service, rtmEvent) {
    if (service.slackUnreadGroupInfo[rtmEvent.channel]) {
      return service.changeDataWithChangeset({
        slackUnreadGroupInfo: {
          [rtmEvent.channel]: {
            mention_count: rtmEvent.mention_count_display,
            unread_count: rtmEvent.unread_count_display
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating the IM has been marked by the user
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm IM
  */
  static rtmImMarked (mailbox, service, rtmEvent) {
    if (service.slackUnreadIMInfo[rtmEvent.channel]) {
      return service.changeDataWithChangeset({
        slackUnreadIMInfo: {
          [rtmEvent.channel]: {
            dm_count: rtmEvent.dm_count
          }
        }
      })
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // Unread: new messages
  /* **************************************************************************/

  /**
  * Handles the RTM indicating a new message was sent
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmMessage (mailbox, service, rtmEvent) {
    if (mailbox.hasSelfOverview) {
      if (mailbox.selfOverview.id === rtmEvent.user) {
        return undefined // We created the message, nothing to do
      }
    }

    switch (rtmEvent.channel[0]) {
      case 'C': return SlackDefaultServiceReducer.rtmChannelMessage(mailbox, service, rtmEvent)
      case 'G': return SlackDefaultServiceReducer.rtmGroupMessage(mailbox, service, rtmEvent)
      case 'D': return SlackDefaultServiceReducer.rtmImMessage(mailbox, service, rtmEvent)
    }
  }

  /**
  * Handles the RTM indicating a new channel message was sent
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmChannelMessage (mailbox, service, rtmEvent) {
    const channelInfo = service.slackUnreadChannelInfo[rtmEvent.channel]
    if (channelInfo) {
      const userMentioned = (rtmEvent.text || '').indexOf(`<@${mailbox.authUserId}>`) !== -1
      return service.changeDataWithChangeset({
        slackUnreadChannelInfo: {
          [rtmEvent.channel]: {
            mention_count: channelInfo.mention_count + (userMentioned ? 1 : 0),
            unread_count: channelInfo.unread_count + 1
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating a new group message was sent
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmGroupMessage (mailbox, service, rtmEvent) {
    const groupInfo = service.slackUnreadGroupInfo[rtmEvent.channel]
    if (groupInfo) {
      const userMentioned = rtmEvent.text.indexOf(`<@${mailbox.authUserId}>`) !== -1
      return service.changeDataWithChangeset({
        slackUnreadGroupInfo: {
          [rtmEvent.channel]: {
            mention_count: groupInfo.mention_count + (userMentioned ? 1 : 0),
            unread_count: groupInfo.unread_count + 1
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating a new IM message was sent
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmImMessage (mailbox, service, rtmEvent) {
    const imInfo = service.slackUnreadIMInfo[rtmEvent.channel]
    if (imInfo) {
      return service.changeDataWithChangeset({
        slackUnreadIMInfo: {
          [rtmEvent.channel]: {
            dm_count: imInfo.dm_count + 1
          }
        }
      })
    } else {
      return undefined
    }
  }
}

export default SlackDefaultServiceReducer
