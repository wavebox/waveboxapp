const CoreServiceAdaptor = require('../CoreServiceAdaptor')

class ContainerServiceAdaptor extends CoreServiceAdaptor {
  /* **************************************************************************/
  // Properties: Match
  /* **************************************************************************/

  get matches () { return this._value_('matches', []) }

  /* **************************************************************************/
  // Properties: Script
  /* **************************************************************************/

  get JS () { return this._value_('js', undefined) }

  /* **************************************************************************/
  // Properties: Style
  /* **************************************************************************/

  get styles () { return this._value_('styles', undefined) }
}

module.exports = ContainerServiceAdaptor
