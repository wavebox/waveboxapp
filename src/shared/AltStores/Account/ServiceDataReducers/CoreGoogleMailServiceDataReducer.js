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
}

export default CoreGoogleMailServiceDataReducer
