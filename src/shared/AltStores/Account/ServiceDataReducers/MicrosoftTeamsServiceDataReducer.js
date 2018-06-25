import ServiceReducer from './ServiceReducer'

class MicrosoftTeamsServiceDataReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'MicrosoftTeamsServiceDataReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the unread count
  * @param serviceData: the service to update
  * @param count: the new count
  */
  static setUnreadCount (serviceData, count) {
    return serviceData.changeData({
      unreadCount: count,
      unreadCountUpdateTime: new Date().getTime()
    })
  }
}

export default MicrosoftTeamsServiceDataReducer
