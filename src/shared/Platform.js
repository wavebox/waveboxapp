import os from 'os'
import semver from 'semver'

class Platform {
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
