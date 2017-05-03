import ServiceReducer from './ServiceReducer'

class GenericDefaultServiceReducer extends ServiceReducer {
  /**
  * Updates the url for the service
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param url: the url to set
  */
  static setUrl (mailbox, service, url) {
    return service.changeData({ url: url })
  }

  /**
  * Updates the setting to open new windows externally
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param openExternal: true to open windows externally
  */
  static setOpenWindowsExternally (mailbox, service, openExternal) {
    return service.changeData({ openWindowsExternally: openExternal })
  }
}

export default GenericDefaultServiceReducer
