import ServiceReducer from './ServiceReducer'

class CoreGoogleMailServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'CoreGoogleMailServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the basic profile info for this account
  * @param service: the service to update
  * @param email: the users email address
  * @param avatar: the users avatar url
  */
  static setProfileInfo (service, email, avatar) {
    return service.changeData({
      serviceDisplayName: email,
      serviceAvatarURL: avatar
    })
  }

  /**
  * Sets the unread mode
  * @param service: the service to update
  * @param unreadMode: the new unread mode
  */
  static setUnreadMode (service, unreadMode) {
    if (service.unreadMode !== unreadMode) {
      return service.changeData({ unreadMode: unreadMode })
    }
  }

  /**
  * Sets a custom unread query to request from google
  * @param service: the service to update
  * @param query: the query string to set
  */
  static setCustomUnreadQuery (service, query) {
    if (query !== service.customUnreadQuery) {
      return service.changeData({ customUnreadQuery: query })
    }
  }

  /**
  * Sets a custom unread query to request from google
  * @param service: the service to update
  * @param str: the watch string
  */
  static setCustomUnreadLabelWatchString (service, str) {
    if (str !== service.customUnreadLabelWatchString) {
      return service.changeData({ customUnreadLabelWatchString: str })
    }
  }

  /**
  * Sets if the custom unread count should be taken from the label
  * @param service: the service to update
  * @param takeFromLabel: true or false
  */
  static setCustomUnreadCountFromLabel (service, takeFromLabel) {
    if (takeFromLabel !== service.customUnreadCountFromLabel) {
      return service.changeData({ customUnreadCountFromLabel: takeFromLabel })
    }
  }

  /**
  * Sets the label to get the custom unread query from
  * @param service: the service to update
  * @param label: the label id
  */
  static setCustomUnreadCountLabel (service, label) {
    if (label !== service.customUnreadCountLabel) {
      return service.changeData({ customUnreadCountLabel: label })
    }
  }

  /**
  * Sets the field to get the custom unread query from
  * @param service: the service to update
  * @param label: the label id
  */
  static setCustomUnreadCountLabelField (service, field) {
    if (field !== service.customUnreadCountLabelField) {
      return service.changeData({ customUnreadCountLabelField: field })
    }
  }
}

export default CoreGoogleMailServiceReducer
