import ServiceDataReducer from './ServiceDataReducer'

class IEngineServiceDataReducer extends ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'IEngineServiceDataReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets an IEngine changeset
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param changeset: the updated notifications
  */
  static setRawIEngineChangeset (service, serviceData, changeset) {
    let isValid = false
    const applyChangeset = [
      'etag',
      'unreadCount',
      'trayMessages',
      'notifications',
      'expando'
    ].reduce((acc, k) => {
      if (changeset.hasOwnProperty(k)) {
        isValid = true
        acc[k] = changeset[k]
      }
      return acc
    }, {})

    if (isValid) {
      return serviceData.changeData(applyChangeset)
    } else {
      return undefined
    }
  }
}

export default IEngineServiceDataReducer
