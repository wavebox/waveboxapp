import ServiceDataReducer from './ServiceDataReducer'

class SlackServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'SlackServiceDataReducer' }

  /* **************************************************************************/
  // Full unread
  /* **************************************************************************/

  /**
  * Sets the unread info
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param unreadInfo: the unread info from the slack api channels: the channels to set
  */
  static setSlackUnreadInfo (service, serviceData, unreadInfo) {
    return serviceData.changeData({
      slackUnreadChannelInfo: unreadInfo.channels.reduce((acc, channel) => {
        acc[channel.id] = {
          id: channel.id,
          name: channel.name,
          is_archived: channel.is_archived,
          is_muted: channel.is_muted,
          is_member: channel.is_member,
          mention_count: channel.mention_count_display,
          has_unreads: channel.has_unreads
        }
        return acc
      }, {}),
      slackUnreadMPIMInfo: unreadInfo.mpims.reduce((acc, mpim) => {
        acc[mpim.id] = {
          id: mpim.id,
          name: mpim.name,
          is_archived: mpim.is_archived,
          is_muted: mpim.is_muted,
          mention_count: mpim.mention_count_display,
          unread_count: mpim.unread_count_display
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
          has_unreads: group.has_unreads
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
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param rtmEvent: the event that came through from the rtm channel
  */
  static rtmChannelMarked (service, serviceData, rtmEvent) {
    if (serviceData.slackUnreadChannelInfo[rtmEvent.channel]) {
      return serviceData.changeDataWithChangeset({
        slackUnreadChannelInfo: {
          [rtmEvent.channel]: {
            mention_count: rtmEvent.mention_count_display,
            has_unreads: rtmEvent.unread_count_display !== 0
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating the group has been marked by the user
  * @param service: the parent service
  * @param serviceData: the serviceData to update
  * @param rtmEvent: the event that came through from the rtm group
  */
  static rtmGroupMarked (service, serviceData, rtmEvent) {
    if (serviceData.slackUnreadGroupInfo[rtmEvent.channel]) {
      return serviceData.changeDataWithChangeset({
        slackUnreadGroupInfo: {
          [rtmEvent.channel]: {
            mention_count: rtmEvent.mention_count_display,
            has_unreads: rtmEvent.unread_count_display !== 0
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating the mpim has been marked by the user
  * @param service: the parent service
  * @param serviceData: the serviceData to update
  * @param rtmEvent: the event that came through from the rtm group
  */
  static rtmMpimMarked (service, serviceData, rtmEvent) {
    if (serviceData.slackUnreadMPIMInfo[rtmEvent.channel]) {
      return serviceData.changeDataWithChangeset({
        slackUnreadMPIMInfo: {
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
  * @param service: the parent service
  * @param serviceData: the serviceData to update
  * @param rtmEvent: the event that came through from the rtm IM
  */
  static rtmImMarked (service, serviceData, rtmEvent) {
    if (serviceData.slackUnreadIMInfo[rtmEvent.channel]) {
      return serviceData.changeDataWithChangeset({
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
  * @param service: the parent service
  * @param serviceData: the serviceData to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmMessage (service, serviceData, rtmEvent) {
    if (service.hasSelfOverview) {
      if (service.selfOverview.id === rtmEvent.user) {
        return undefined // We created the message, nothing to do
      } else if (service.selfOverview.id === ((rtmEvent.message || {}).edited || {}).user) {
        return undefined // We edited the message, nothing to do
      } else if (service.selfOverview.id === (rtmEvent.comment || {}).user) {
        return undefined // We commented on an item, nothing to do
      }
    }

    switch (rtmEvent.channel[0]) {
      case 'C': return SlackServiceDataReducer.rtmChannelMessage(service, serviceData, rtmEvent)
      case 'G': return SlackServiceDataReducer.rtmGroupMessage(service, serviceData, rtmEvent)
      case 'D': return SlackServiceDataReducer.rtmImMessage(service, serviceData, rtmEvent)
    }
  }

  /**
  * Handles the RTM indicating a new channel message was sent
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmChannelMessage (service, serviceData, rtmEvent) {
    const channelInfo = serviceData.slackUnreadChannelInfo[rtmEvent.channel]
    if (channelInfo) {
      const userMentioned = (rtmEvent.text || '').indexOf(`<@${service.authUserId}>`) !== -1
      return serviceData.changeDataWithChangeset({
        slackUnreadChannelInfo: {
          [rtmEvent.channel]: {
            mention_count: channelInfo.mention_count + (userMentioned ? 1 : 0),
            has_unreads: true
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating a new group message was sent
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmGroupMessage (service, serviceData, rtmEvent) {
    if (serviceData.slackUnreadGroupInfo[rtmEvent.channel]) { // Group
      const groupInfo = serviceData.slackUnreadGroupInfo[rtmEvent.channel]
      const userMentioned = rtmEvent.text.indexOf(`<@${service.authUserId}>`) !== -1
      return serviceData.changeDataWithChangeset({
        slackUnreadGroupInfo: {
          [rtmEvent.channel]: {
            mention_count: groupInfo.mention_count + (userMentioned ? 1 : 0),
            has_unreads: true
          }
        }
      })
    } else if (serviceData.slackUnreadMPIMInfo[rtmEvent.channel]) { // MPIM
      const mpimInfo = serviceData.slackUnreadMPIMInfo[rtmEvent.channel]
      const userMentioned = rtmEvent.text.indexOf(`<@${service.authUserId}>`) !== -1
      return serviceData.changeDataWithChangeset({
        slackUnreadMPIMInfo: {
          [rtmEvent.channel]: {
            mention_count: mpimInfo.mention_count + (userMentioned ? 1 : 0),
            unread_count: mpimInfo.unread_count + 1
          }
        }
      })
    } else {
      return undefined
    }
  }

  /**
  * Handles the RTM indicating a new IM message was sent
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param rtmEvent: the event that came through from the rtm
  */
  static rtmImMessage (service, serviceData, rtmEvent) {
    const imInfo = serviceData.slackUnreadIMInfo[rtmEvent.channel]
    if (imInfo) {
      return serviceData.changeDataWithChangeset({
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

export default SlackServiceDataReducer
