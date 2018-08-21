import ServiceReducer from './ServiceReducer'

class ContainerServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ContainerServiceReducer' }

  /* **************************************************************************/
  // Reducers
  /* **************************************************************************/

  /**
  * Sets the display name for this account
  * @param service: the service to update
  * @param displayName: the display name
  */
  static setDisplayName (service, displayName) {
    return service.changeData({ displayName: displayName })
  }
}

export default ContainerServiceReducer
