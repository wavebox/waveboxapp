import ServiceReducer from './ServiceReducer'

class GenericServiceReducer extends ServiceReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'GenericServiceReducer' }

  /* **************************************************************************/
  // Settings
  /* **************************************************************************/

  /**
  * Updates the url for the service
  * @param service: the service to update
  * @param url: the url to set
  */
  static setUrl (service, url) {
    return service.changeData({ url: url })
  }

  /**
  * Updates the setting to show the navigation toolbar
  * @param service: the service to update
  * @param has: true to if it has the toolbar
  */
  static setHasNavigationToolbar (service, has) {
    return service.changeData({ hasNavigationToolbar: has })
  }

  /**
  * Updates the setting to show adaptor data
  * @param service: the service to update
  * @param supports: true to supports, false otherwise
  */
  static setSupportsWBGAPI (service, supports) {
    return service.changeData({ supportsWBGAPI: supports })
  }

  /**
  * Sets whether to use the page title as the display name or not
  * @param service: the service to update
  * @param use: true to use, false otherwise
  */
  static setUsePageTitleAsDisplayName (service, use) {
    return service.changeData({ usePageTitleAsDisplayName: use })
  }

  /**
  * Sets whether to use the page theme as the color or not
  * @param service: the service to update
  * @param use: true to use, false otherwise
  */
  static setUsePageThemeAsColor (service, use) {
    return service.changeData({ usePageThemeAsColor: use })
  }
}

export default GenericServiceReducer
