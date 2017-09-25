const path = require('path')
const pkg = require('../package.json')
const AppDirectory = require('appdirectory')
const RuntimePaths = require('../shared/Runtime/RuntimePaths')
const NotificationPermissionManager = require('../shared/RUntime/NotificationPermissionManager')

const runtimePaths = RuntimePaths(pkg, path, AppDirectory)
const notificationPermissionManager = new NotificationPermissionManager(runtimePaths.NOTIFICATION_PERMISSION_PATH)

module.exports = {
  /**
  * Requires the app package
  * @return the app package
  */
  package: () => {
    return pkg
  },

  /**
  * Requires a module from shared folder
  * @param n: the name of the module
  * @return the module
  */
  shared: (n) => {
    return require(path.join('../shared/', n))
  },

  /**
  * @return the runtime paths object
  */
  runtimePaths: () => { return runtimePaths },

  notificationPermissionManager: () => { return notificationPermissionManager }
}
