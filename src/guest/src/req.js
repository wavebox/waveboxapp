const path = require('path')
const fs = require('fs-extra')
const pkg = require('../package.json')
const AppDirectory = require('appdirectory')
const RuntimePaths = require('../shared/Runtime/RuntimePaths')

const runtimePaths = RuntimePaths(pkg, path, AppDirectory)

module.exports = {
  /**
  * Requires the app package
  * @return the app package
  */
  package: () => { return pkg },

  /**
  * Requires a module from shared folder
  * @param n: the name of the module
  * @return the module
  */
  shared: (n) => { return require(path.join('../shared/', n)) },

  /**
  * Loads a guest Api from the guestApi folder
  * @param n: the name of the module
  * @return the module as a string
  */
  guestApi: (n) => { return fs.readFileSync(require.resolve(path.join('../../guestApi/', n))) },

  /**
  * Gets the path to the chrome extension api
  * @return the path
  */
  crextensionApiPath: () => {
    return require.resolve('../../crextensionApi/crextensionApi')
  },

  /**
  * @return the runtime paths object
  */
  runtimePaths: () => { return runtimePaths },

  /**
  * The path to node modules in the app directory
  * @param n: the name of the module
  * @return the path to the module
  */
  appNodeModulesPath: (n) => { return require.resolve(path.join('../../app/node_modules', n)) },

  /**
  * The module from node modules in the app directory
  * @param n: the name of the module
  * @return the module
  */
  appNodeModules: (n) => { return require(require.resolve(path.join('../../app/node_modules', n))) }
}
