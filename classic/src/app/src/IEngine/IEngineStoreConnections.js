const privAccount = Symbol('privAccount')

class IEngineStoreConnections {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privAccount] = undefined
  }

  /* **************************************************************************/
  // Propeties
  /* **************************************************************************/

  get isAccountConnected () { return !!this[privAccount] }
  get accountStore () { return this[privAccount].store }
  get accountActions () { return this[privAccount].actions }

  /* **************************************************************************/
  // Connectors
  /* **************************************************************************/

  /**
  * Connects the account store to the api
  * @param accountStore: the account store
  * @param accountActions: the account actions
  */
  connectAccount (accountStore, accountActions) {
    if (this.isAccountConnected) {
      throw new Error('Account is already connected to IEngineStoreConnections. Refusing to connect')
    }
    this[privAccount] = { store: accountStore, actions: accountActions }
  }
}

export default IEngineStoreConnections
