const { RELEASE_CHANNELS } = require('./constants')
class Release {
  /**
  * Generates the version components
  * @param pkg: the current package info
  * @param wireConfigVersion=undefined: the current wire config version
  * @param installMethod=undefined: the install method
  * @return an array of plain text strings with the version info
  */
  static generateVersionComponents (pkg, wireConfigVersion = undefined, installMethod = undefined) {
    const info = []

    info.push([
      `Version ${pkg.version}`,
      pkg.releaseChannel === RELEASE_CHANNELS.BETA ? 'beta' : undefined,
      installMethod && installMethod !== 'unknown' ? `(${installMethod})` : undefined
    ].filter((c) => !!c).join(' '))

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
