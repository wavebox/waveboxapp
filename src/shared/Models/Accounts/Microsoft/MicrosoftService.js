const CoreService = require('../CoreService')

class MicrosoftService extends CoreService {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ACCESS_MODES () { return this.__metadata__.ACCESS_MODES }
  get accessMode () { return this.__metadata__.accessMode }
}

module.exports = MicrosoftService
