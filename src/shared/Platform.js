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

  /* **************************************************************************/
  // Darwin Utils
  /* **************************************************************************/

  /**
  * Sanitizes the zoom level for macOS mojave to work around issues/817
  * @param zoom: the zoom we want to apply
  * @return the zoom we should apply
  */
  static getDarwinMojaveCorrectedZoomLevel (zoom) {
    if (!this.isDarwinMojave()) { return zoom }

    const sanitizedZoom = Math.round(zoom * 10) / 10
    if (sanitizedZoom === 1.0) {
      return 1.001
    } else {
      return zoom
    }
  }
}

export default Platform
