import alt from '../alt'

class SlackActions {
  /* **************************************************************************/
  // Connection Open
  /* **************************************************************************/

  /**
  * Connects all services
  */
  connectAllServices () { return {} }

  /**
  * Connects a service
  * @param serviceId: the id of the service
  */
  connectService (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Reconnection
  /* **************************************************************************/

  /**
  * Reconnects a service by tearing it down and bringing it back up again
  * @param serviceId: the id of the service
  */
  reconnectService (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Connection Close
  /* **************************************************************************/

  /**
  * Disconnects all services
  */
  disconnectAllServices () { return {} }

  /**
  * Disconnects a service
  * @param serviceId: the id of the service
  */
  disconnectService (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Unread counts
  /* **************************************************************************/

  /**
  * Indicates that the unread counts may have changed
  * @param serviceId: the id of the service
  * @param allowMultiple=false: set to true if you want to allow this request to go out
  * even if one is already in progress
  */
  updateUnreadCounts (serviceId, allowMultiple = false) {
    return { serviceId: serviceId, allowMultiple: allowMultiple }
  }

  /* **************************************************************************/
  // Notification
  /* **************************************************************************/

  /**
  * Sends a slack notification on behalf of a service
  * @param serviceId: the id of the service
  * @param message: the message that came off slack
  */
  scheduleNotification (serviceId, message) {
    return {
      serviceId: serviceId,
      message: message
    }
  }

  /**
  * Schedules a html5 notification
  * @param serviceId: the id of the service
  * @param notificationId: the id of the html5 notification
  * @param notification: the notification object
  * @param clickHandler: the click handler provided
  */
  scheduleHTML5Notification (serviceId, notificationId, notification, clickHandler) {
    return {
      serviceId: serviceId,
      notificationId: notificationId,
      notification: notification,
      clickHandler: clickHandler
    }
  }
}

export default alt.createActions(SlackActions)
