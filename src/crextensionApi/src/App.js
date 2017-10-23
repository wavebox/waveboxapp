const privExtensionId = Symbol('privExtensionId')
const privExtensionDatasource = Symbol('privExtensionDatasource')

class App {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param extensionId: the id of the extension
  * @param extensionDatasource: the datasource for the extension
  */
  constructor (extensionId, extensionDatasource) {
    this[privExtensionId] = extensionId
    this[privExtensionDatasource] = extensionDatasource

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  getDetails () {
    return this[privExtensionDatasource].manifest.cloneData()
  }
}

export default App
