class ServiceDataReducer {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get name () { return 'ServiceDataReducer' }

  /* **************************************************************************/
  // Urls
  /* **************************************************************************/

  /**
  * Sets the last url of the service
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param url: the current url
  */
  static setUrl (service, serviceData, url) {
    return serviceData.changeData({ url: url })
  }

  /**
  * Clears  the last url of the service
  * @param service: the parent service
  * @param serviceData: the service to update
  */
  static clearUrl (service, serviceData) {
    return serviceData.changeData({ url: undefined })
  }

  /**
  * Sets the document title
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param url: the current url
  */
  static setDocumentTitle (service, serviceData, title) {
    return serviceData.changeData({ documentTitle: title })
  }

  /**
  * Sets the favicons
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param url: the current url
  */
  static setFavicons (service, serviceData, favicons) {
    return serviceData.changeData({ favicons: favicons })
  }

  /**
  * Sets the document theme
  * @param service: the parent service
  * @param serviceData: the service to update
  * @param theme: the document theme
  */
  static setDocumentTheme (service, serviceData, theme) {
    return serviceData.changeData({ documentTheme: theme })
  }

  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Runs the mergeChangesetOnActive merge on the service
  * @param service: the parent service
  * @param service: the service to update
  */
  static mergeChangesetOnActive (service, serviceData) {
    if (serviceData.mergeChangesetOnActive) {
      return serviceData.changeData(serviceData.mergeChangesetOnActive)
    } else {
      return undefined
    }
  }

  /* **************************************************************************/
  // Guest Api
  /* **************************************************************************/

  /**
  * Sets the wgapi unread activity
  * @param service: the parent service
  * @param service: the service to update
  * @param hasActivity: true if there is activity, false otherwise
  */
  static setWbgapiHasUnreadActivity (service, serviceData, hasActivity) {
    if (!service.supportsWBGAPI) { return undefined }
    return serviceData.changeData({ '::wbgapi:hasUnreadActivity': hasActivity })
  }

  /**
  * Sets the wgapi unread count
  * @param service: the parent service
  * @param service: the service to update
  * @param count: the new count
  */
  static setWbgapiUnreadCount (service, serviceData, count) {
    if (!service.supportsWBGAPI) { return undefined }
    return serviceData.changeData({ '::wbgapi:unreadCount': count })
  }

  /**
  * Sets the wgapi tray messages
  * @param service: the parent service
  * @param service: the service to update
  * @param messages: the array of messages
  */
  static setWbgapiTrayMessages (service, serviceData, messages) {
    if (!service.supportsWBGAPI) { return undefined }
    return serviceData.changeData({ '::wbgapi:trayMessages': messages })
  }
}

export default ServiceDataReducer
