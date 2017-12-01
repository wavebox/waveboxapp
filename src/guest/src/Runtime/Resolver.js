import path from 'path'

class Resolver {
  /* ****************************************************************************/
  // Resolvers
  /* ****************************************************************************/

  /**
  * Resolves a api script
  * @param name: the name of the script
  * @return the full path to the file
  */
  static guestApi (name) {
    return path.join(__dirname, '../guestApi/', name)
  }

  /**
  * Resolves the crextension api
  * @return the full path to the file
  */
  static crextensionApi () {
    return path.join(__dirname, '../crextensionApi/crextensionApi.js')
  }

  /**
  * Resolves a node modules name in app package
  * @param name: the name of the script
  * @return the full path to the file
  */
  static appNodeModules (name) {
    return path.join(__dirname, '../app/node_modules/', name)
  }
}

export default Resolver
