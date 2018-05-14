const privExtensionId = Symbol('privExtensionId')

class Permissions {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * https://developer.chrome.com/apps/permissions
  * @param extensionId: the id of the extension
  * @param extensionDatasource: the datasource for the extension
  */
  constructor (extensionId) {
    this[privExtensionId] = extensionId

    Object.freeze(this)
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  contains (permissions, callback) {
    console.warn('chrome.permissions.contains is not currently spec compliant')
    setTimeout(() => {
      const res = true
      callback(res)
    })
  }

  request (permissions, callback) {
    console.warn('chrome.permissions.request is not currently spec compliant')
    setTimeout(() => {
      const res = true
      callback(res)
    })
  }
}

export default Permissions
