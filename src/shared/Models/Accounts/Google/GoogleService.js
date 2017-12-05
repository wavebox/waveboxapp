const CoreService = require('../CoreService')

class GoogleService extends CoreService {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get openDriveLinksWithDefaultOpener () { return this.__metadata__.openDriveLinksWithDefaultOpener }
}

module.exports = GoogleService
