import CoreACServiceAdaptor from '../CoreACServiceAdaptor'

class ContainerServiceAdaptor extends CoreACServiceAdaptor {
  /* **************************************************************************/
  // Properties: SAPI
  /* **************************************************************************/

  get isSAPI () { return this._value_('isSAPI', false) }

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

export default ContainerServiceAdaptor
