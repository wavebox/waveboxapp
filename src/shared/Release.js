const { RELEASE_CHANNELS } = require('./constants')
class Release {
  /**
  * Generates the version components
  * @param pkg: the current package info
  * @param wireConfigVersion: the current wire config version
  * @return an array of plain text strings with the version info
  */
  static generateVersionComponents (pkg, wireConfigVersion = undefined) {
    const info = []

    if (pkg.releaseChannel === RELEASE_CHANNELS.BETA) {
      info.push(`Version ${pkg.version}beta`)
    } else {
      info.push(`Version ${pkg.version}`)
    }

    if (pkg.earlyBuildId) {
      info.push(`Early Build Reference: ${pkg.earlyBuildId}`)
    }

    if (wireConfigVersion) {
      info.push(`Wire Config Version: ${wireConfigVersion}`)
    }

    return info
  }
  /**
  * Generates a version string
  * @param pkg: the current package info
  * @param delimeter=\n: the delimeter to use between sections
  * @return a plain string with the version info
  */
  static generateVersionString (pkg, delimeter = '\n') {
    return this.generateVersionComponents(pkg).join(delimeter)
  }
}

module.exports = Release
