import path from 'path'
import pathTool from 'shared/pathTool'

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

  /**
  * Scopes a resolution to a path
  * @param scopeTo: the path to scope the resolves to
  * @param name: the name of the file to resolve
  * @param targetApi: the api type to target
  * @param allowWeb: true to allow http:// and https:// urls
  * @return a resolved url or path or an empty string on failure
  */
  static _scopedResolve (scopeTo, name, targetApi, allowWeb) {
    if (allowWeb) {
      if (name.startsWith('http://') || name.startsWith('https://')) {
        return name
      }
    }

    const scoped = pathTool.scopeToDir(scopeTo, name)
    if (scoped) {
      switch (targetApi) {
        case API_TYPES.NODE: return this._joinNodePath(scoped)
        case API_TYPES.BROWSER: return this._joinBrowserPath(scoped)
      }
    }

    return ''
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
  * Resolves a guest preload script
  * @param name: the name of the script
  * @param targetApi=NODE: the target api
  * @return the full path to the file
  */
  static crExtensionApiPreload (name, targetApi = API_TYPES.NODE) {
    switch (targetApi) {
      case API_TYPES.NODE: return this._joinNodePath(__dirname, '../../crextensionApi/crextensionApi.js')
      case API_TYPES.BROWSER: return this._joinBrowserPath(__dirname, '../../crextensionApi/crextensionApi.js')
    }
  }

  /**
  * Resolves an icon path
  * @param name: the name of the icon
  * @param targetApi=BROWSER: the target api
  * @return the full path to the file
  */
  static icon (name, targetApi = API_TYPES.BROWSER) {
    return this._scopedResolve(path.join(__dirname, '../../icons'), name, targetApi, true)
  }

  /**
  * Resolves an image path
  * @param name: the name of the image
  * @param targetApi=BROWSER: the target api
  * @return the full path to the file
  */
  static image (name, targetApi = API_TYPES.BROWSER) {
    return this._scopedResolve(path.join(__dirname, '../../images'), name, targetApi, true)
  }
}

export default Resolver
