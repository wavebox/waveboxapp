import CoreACModel from './CoreACModel'
import SERVICE_TYPES from './ServiceTypes'

class CoreACServiceData extends CoreACModel {
  /* **************************************************************************/
  // Class : Types
  /* **************************************************************************/

  static get SERVICE_TYPES () { return SERVICE_TYPES }

  /* **************************************************************************/
  // Class : Creating
  /* **************************************************************************/

  /**
  * Creates a blank js object that can used to instantiate this data
  * @param id: the id of th eservice
  * @param parentType: the type of the parent service
  * @return a vanilla js object representing the data for this service data
  */
  static createJS (id, parentType) {
    return {
      id: id,
      changedTime: new Date().getTime(),
      parentType: parentType
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get parentId () { return this.id }
  get parentType () { return this._value_('parentType') }

  /* **************************************************************************/
  // Page
  /* **************************************************************************/

  get url () { return this._value_('url', undefined) }
  get documentTitle () { return this._value_('documentTitle', undefined) }
  get favicons () { return this._value_('favicons', []) }
  get documentTheme () { return this._value_('documentTheme', undefined) }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  get mergeChangesetOnActive () { return undefined }

  /* **************************************************************************/
  // Unread indicators
  /* **************************************************************************/

  get unreadCount () { return 0 }
  get hasUnreadActivity () { return false }
  get trayMessages () { return [] }
  get notifications () { return [] }

  /* **************************************************************************/
  // Guest Api
  /* **************************************************************************/

  get wbgapiHasUnreadActivity () {
    return this._valueOfType_('::wbgapi:hasUnreadActivity', 'boolean', false)
  }
  get wbgapiUnreadCount () {
    return parseInt(this._valueOfType_('::wbgapi:unreadCount', 'number', 0))
  }
  get wbgapiTrayMessages () {
    return this._valueOfType_('::wbgapi:trayMessages', 'array', [])
  }

  /* **************************************************************************/
  // Unread getters
  /* **************************************************************************/

  /**
  * Gets the unread count
  * @param service: the service we're getting the count for to customize the response
  * @return the count
  */
  getUnreadCount (service) {
    return service.supportsWBGAPI ? this.wbgapiUnreadCount : this.unreadCount
  }

  /**
  * Gets if the account has unread activity
  * @param service: the service we're getting the count for to customize the response
  * @return the count
  */
  getHasUnreadActivity (service) {
    return service.supportsWBGAPI ? this.wbgapiHasUnreadActivity : this.hasUnreadActivity
  }

  /**
  * Gets if the account has tray messages
  * @param service: the service we're getting the count for to customize the response
  * @return the count
  */
  getTrayMessages (service) {
    return service.supportsWBGAPI ? this.wbgapiTrayMessages : this.trayMessages
  }
}

export default CoreACServiceData
