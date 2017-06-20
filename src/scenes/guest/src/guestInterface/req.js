const path = require('path')

module.exports = {
  /**
  * Requires a module from node modules
  * @param n: the name of the module
  * @return the module
  */
  modules: (n) => {
    return require(path.join('../../../app/node_modules/', n))
  },

  /**
  * Requires the app package
  * @return the app package
  */
  package: () => {
    return require('../../../app/package.json')
  },

  /**
  * Requires a module from app folder
  * @param n: the name of the module
  * @return the module
  */
  app: (n) => {
    return require(path.join('../../../app/app/', n))
  },

  /**
  * Requires a module from shared folder
  * @param n: the name of the module
  * @return the module
  */
  shared: (n) => {
    return require(path.join('../../../app/shared/', n))
  },

  /**
  * Requires a module from the apps mproc folder
  * @param n: the name of the module
  * @return the module
  */
  mprocManager: (n) => {
    return require(path.join('../../../app/app/MProcManagers', n))
  }
}
