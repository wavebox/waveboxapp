import path from 'path'

const API_TYPES = Object.freeze({
  BROWSER: 'BROWSER',
  NODE: 'NODE'
})

class Resolver {
  /* ****************************************************************************/
  // Types
  /* ****************************************************************************/

  static get API_TYPES () { return API_TYPES }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Joins a real path for use in node apis
  * @return the joined path
  */
  static _joinNodePath (...components) {
    return path.join(...components)
  }

  /**
  * Joins a browser path for use in the browser
  * @return the joined path
  */
  static _joinBrowserPath (...components) {
    if (process.platform === 'win32') {
      return path.join(...components).replace(/\\/g, '/')
    } else {
      return path.join(...components)
    }
  }

  /* ****************************************************************************/
  // Resolvers
  /* ****************************************************************************/

  /**
  * Resolves a guest preload script
  * @param name: the name of the script
  * @param targetApi=NODE: the target api
  * @return the full path to the file
  */
  static guestPreload (name, targetApi = API_TYPES.NODE) {
    switch (targetApi) {
      case API_TYPES.NODE: return this._joinNodePath(__dirname, '../../guest/guest.js')
      case API_TYPES.BROWSER: return this._joinBrowserPath(__dirname, '../../guest/guest.js')
    }
  }

  /**
  * Resolves an icon path
  * @param name: the name of the icon
  * @param targetApi=NODE: the target api
  * @return the full path to the file
  */
  static icon (name, targetApi = API_TYPES.NODE) {
    switch (targetApi) {
      case API_TYPES.NODE: return this._joinNodePath(__dirname, '../../icons', name)
      case API_TYPES.BROWSER: return this._joinBrowserPath(__dirname, '../../icons', name)
    }
  }

  /**
  * Resolves an image path
  * @param name: the name of the image
  * @param targetApi=NODE: the target api
  * @return the full path to the file
  */
  static image (name, targetApi = API_TYPES.NODE) {
    switch (targetApi) {
      case API_TYPES.NODE: return this._joinNodePath(__dirname, '../../images', name)
      case API_TYPES.BROWSER: return this._joinBrowserPath(__dirname, '../../images', name)
    }
  }
}

export default Resolver
