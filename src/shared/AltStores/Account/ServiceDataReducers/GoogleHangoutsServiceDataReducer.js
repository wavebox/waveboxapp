import ServiceDataReducer from './ServiceDataReducer'

class GoogleHangoutsServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleHangoutsServiceDataReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the unread count
  * @param service: the parent service
  * @param serviceData: the service data to update
  * @param count: the new count
  */
  static setUnreadCount (service, serviceData, count) {
    return serviceData.changeData({
      unreadCount: count,
      unreadCountUpdateTime: new Date().getTime()
    })
  }
}

export default GoogleHangoutsServiceDataReducer
