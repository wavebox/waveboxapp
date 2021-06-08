import Log from 'Core/Log'
const privExtensionId = Symbol('privExtensionId')

const UNSUPPORTED_PERMISSIONS = new Set([
  'nativeMessaging'
])

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

  contains (test, callback) {
    Log.warn('chrome.permissions.contains is not currently spec compliant')
    const unsupported = (test.permissions || []).find((p) => UNSUPPORTED_PERMISSIONS.has(p))

    setTimeout(() => {
      const res = !!unsupported
      callback(res)
    })
  }

  request (permissions, callback) {
    Log.warn('chrome.permissions.request is not currently spec compliant')
    setTimeout(() => {
      const res = true
      callback(res)
    })
  }
}

export default Permissions
