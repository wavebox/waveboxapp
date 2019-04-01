import ServiceDataReducer from './ServiceDataReducer'

class CoreGoogleMailServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'CoreGoogleMailServiceDataReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Updates the unread info for gmail
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param historyId: the new history id
  * @param unreadCount: the current unread count
  * @param unreadThreads: an array of full thread infos that have not been read
  */
  static updateUnreadInfo (service, serviceData, historyId, unreadCount, unreadThreads) {
    return serviceData.changeData({
      historyId: isNaN(parseInt(historyId)) ? undefined : parseInt(historyId),
      unreadCount: unreadCount,
      unreadThreads: unreadThreads
    })
  }

  /**
  * Sets the history id on the service
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param historyId: the new history id
  */
  static setHistoryId (service, serviceData, historyId) {
    historyId = isNaN(parseInt(historyId)) ? undefined : parseInt(historyId)
    if (serviceData.historyId !== historyId) {
      return serviceData.changeData({ historyId: historyId })
    }
  }

  /**
  * Updates the unread count
  * @param service: the parent service
  * @param serviceData: the service data to update
  * @param count: the new count
  */
  static updateUnreadCount (service, serviceData, count) {
    if (serviceData.unreadCount !== count) {
      return serviceData.changeData({ unreadCount: count })
    }
  }

  /**
  * Updates the history id
  * @param service: the parent service
  * @param serviceData: the service data to update
  * @param historyId: the new history id
  */
  static updateHistoryId (service, serviceData, historyId) {
    const val = isNaN(parseInt(historyId)) ? undefined : parseInt(historyId)
    if (serviceData.historyId !== val) {
      return serviceData.changeData({ historyId: val })
    }
  }

  /**
  * Updates the unread threads
  * @param service: the parent service
  * @param serviceData: the service data to update
  * @param threads: the unread threads
  */
  static updateUnreadThreads (service, serviceData, threads) {
    return serviceData.changeData({ unreadThreads: threads })
  }
}

export default CoreGoogleMailServiceDataReducer
