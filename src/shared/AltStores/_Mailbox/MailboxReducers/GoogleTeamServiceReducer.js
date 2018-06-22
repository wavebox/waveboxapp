import ServiceReducer from './ServiceReducer'

class GoogleTeamServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GoogleTeamServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets whether a service has unread activity or not
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param hasActivity: true if there is activity, false otherwise
  */
  static setHasUnreadActivity (mailbox, service, hasActivity) {
    if (service.hasUnreadActivity === hasActivity) { return undefined }
    return service.changeData({
      hasUnreadActivity: hasActivity
    })
  }
}

export default GoogleTeamServiceReducer
