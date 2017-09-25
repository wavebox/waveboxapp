import path from 'path'

class Resolver {
  /**
  * Resolves a guest preload script
  * @param name: the name of the script
  * @return the full path to the file
  */
  static guestPreload (name) {
    return path.join('../../guest/guest/preload/', name)
  }

  /**
  * Resolves an icon path
  * @param name: the name of the icon
  * @return the full path to the file
  */
  static icon (name) {
    return path.join(path.dirname(window.location.pathname), '../../icons', name)
  }
}

export default Resolver
