const path = require('path')

module.exports = {
  /**
  * Requires the app package
  * @return the app package
  */
  package: () => {
    return require('../package.json')
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
  * Requires a module from the apps mproc folder
  * @param n: the name of the module
  * @return the module
  */
  mprocManager: (n) => {
    return require(path.join('../../app/app/MProcManagers', n))
  }
}
