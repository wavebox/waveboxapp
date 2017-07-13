const { RELEASE_CHANNELS } = require('./constants')
class Release {
  /**
  * Generates the version components
  * @param pkg: the current package info
  * @return an array of plain text strings with the version info
  */
  static generateVersionComponents (pkg) {
    if (pkg.earlyBuildId) {
      return [
        `Version ${pkg.version}`,
        `Early Build Reference: ${pkg.earlyBuildId}`
      ]
    } else if (pkg.releaseChannel === RELEASE_CHANNELS.BETA) {
      return [`Version ${pkg.version}beta`]
    } else {
      return [`Version ${pkg.version}`]
    }
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
