import os from 'os'
import semver from 'semver'

const PACKAGE_MANAGERS = Object.freeze({
  SNAP: 'SNAP',
  APT: 'APT',
  YUM: 'YUM',
  ZYPPER: 'ZYPPER',
  UNKNOWN: 'UNKNOWN'
})

class Platform {
  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  static get PACKAGE_MANAGERS () { return PACKAGE_MANAGERS }
  static get SQUIRREL_UPDATE_ENABLED_ON_PLATFORM () { return process.platform === 'darwin' || process.platform === 'win32' }

  /* **************************************************************************/
  // Darwin Getters
  /* **************************************************************************/

  /**
  * Checks if we are macOS mojave
  * @return true if we are mojave, false otherwise
  */
  static isDarwinMojave () {
    if (process.platform === 'darwin') {
      try {
        return semver.satisfies(os.release(), '18.x.x') // Mojave lists itself as 18.0.0
      } catch (ex) {
        return false
      }
    }
    return false
  }
}

export default Platform
