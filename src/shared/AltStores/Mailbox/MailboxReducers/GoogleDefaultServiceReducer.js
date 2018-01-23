import ServiceReducer from './ServiceReducer'

class GoogleDefaultServiceReducer extends ServiceReducer {
  /**
  * Updates the unread info for gmail
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param historyId: the new history id
  * @param unreadCount: the current unread count
  * @param unreadThreads: an array of full thread infos that have not been read
  */
  static updateUnreadInfo (mailbox, service, historyId, unreadCount, unreadThreads) {
    return service.changeData({
      historyId: isNaN(parseInt(historyId)) ? undefined : parseInt(historyId),
      unreadCount: unreadCount,
      unreadThreads: unreadThreads
    })
  }

  /**
  * Sets the history id on the service
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param historyId: the new history id
  */
  static setHistoryId (mailbox, service, historyId) {
    historyId = isNaN(parseInt(historyId)) ? undefined : parseInt(historyId)
    if (service.historyId !== historyId) {
      return service.changeData({ historyId: historyId })
    }
  }

  /**
  * Sets the unread mode
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param unreadMode: the new unread mode
  */
  static setUnreadMode (mailbox, service, unreadMode) {
    if (service.unreadMode !== unreadMode) {
      return service.changeData({ unreadMode: unreadMode })
    }
  }

  /**
  * Sets a custom unread query to request from google
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param query: the query string to set
  */
  static setCustomUnreadQuery (mailbox, service, query) {
    if (query !== service.customUnreadQuery) {
      return service.changeData({ customUnreadQuery: query })
    }
  }

  /**
  * Sets a custom unread query to request from google
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param str: the watch string
  */
  static setCustomUnreadLabelWatchString (mailbox, service, str) {
    if (str !== service.customUnreadLabelWatchString) {
      return service.changeData({ customUnreadLabelWatchString: str })
    }
  }

  /**
  * Sets if the custom unread count should be taken from the label
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param takeFromLabel: true or false
  */
  static setCustomUnreadCountFromLabel (mailbox, service, takeFromLabel) {
    if (takeFromLabel !== service.customUnreadCountFromLabel) {
      return service.changeData({ customUnreadCountFromLabel: takeFromLabel })
    }
  }

  /**
  * Sets the label to get the custom unread query from
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param label: the label id
  */
  static setCustomUnreadCountLabel (mailbox, service, label) {
    if (label !== service.customUnreadCountLabel) {
      return service.changeData({ customUnreadCountLabel: label })
    }
  }

  /**
  * Sets the field to get the custom unread query from
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param label: the label id
  */
  static setCustomUnreadCountLabelField (mailbox, service, field) {
    if (field !== service.customUnreadCountLabelField) {
      return service.changeData({ customUnreadCountLabelField: field })
    }
  }
}

export default GoogleDefaultServiceReducer
