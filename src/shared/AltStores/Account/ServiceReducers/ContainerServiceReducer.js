import ServiceReducer from './ServiceReducer'

class ContainerServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ContainerServiceReducer' }

  /* **************************************************************************/
  // Settings
  /* **************************************************************************/

  /**
  * Updates the setting to show the navigation toolbar
  * @param service: the service to update
  * @param has: true to if it has the toolbar
  */
  static setHasNavigationToolbar (service, has) {
    return service.changeData({ hasNavigationToolbar: has })
  }

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
