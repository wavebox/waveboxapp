const Model = require('../../Model')

class CoreServiceAdaptor extends Model {
  /* **************************************************************************/
  // Properties: Match
  /* **************************************************************************/

  get matches () { return [] }

  /* **************************************************************************/
  // Properties: Script
  /* **************************************************************************/

  get JS () { return undefined }
  get hasJS () { return !!this.JS }

  /* **************************************************************************/
  // Properties: Style
  /* **************************************************************************/

  get styles () { return undefined }
  get hasStyles () { return !!this.styles }
}

module.exports = CoreServiceAdaptor
