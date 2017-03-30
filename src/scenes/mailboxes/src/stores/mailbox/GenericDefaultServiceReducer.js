const ServiceReducer = require('./ServiceReducer')

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
}

module.exports = GenericDefaultServiceReducer
