import fs from 'fs-extra'
import path from 'path'
import getos from 'getos'
import Platform from 'shared/Platform'

const LINUX_PACKAGE_MANGER_BY_OS_NAME = Object.freeze({
  'Fedora': Platform.PACKAGE_MANAGERS.YUM,
  'Centos': Platform.PACKAGE_MANAGERS.YUM,
  'SUSE Linux': Platform.PACKAGE_MANAGERS.ZYPPER,
  'Ubuntu Linux': Platform.PACKAGE_MANAGERS.APT,
  'IYCC': Platform.PACKAGE_MANAGERS.APT,
  'Linux Mint': Platform.PACKAGE_MANAGERS.APT,
  'elementary OS': Platform.PACKAGE_MANAGERS.APT,
  'Debian': Platform.PACKAGE_MANAGERS.APT,
  'Raspbian': Platform.PACKAGE_MANAGERS.APT
})

const privDistributionConfig = Symbol('privDistributionConfig')

class DistributionConfig {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privDistributionConfig] = undefined
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  _loadDistributionConfig () {
    if (this[privDistributionConfig] === undefined) {
      try {
        this[privDistributionConfig] = fs.readJsonSync(path.join(__dirname, './distributionConfig.json'))
      } catch (ex) {
        this[privDistributionConfig] = {}
      }
    }
    return this[privDistributionConfig]
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get installMethod () { return this._loadDistributionConfig().installMethod || 'unknown' }
  get isSnapInstall () { return process.platform === 'linux' && this.installMethod === 'snap' }
  get isDebInstall () { return process.platform === 'linux' && this.installMethod === 'deb' }
  get PACKAGE_MANAGERS () { return Platform.PACKAGE_MANAGERS }

  /* **************************************************************************/
  // Getters
  /* **************************************************************************/

  /**
  * Gets the default package manager
  * @return promise with the package manager or UNKNOWN
  */
  getDefaultOSPackageManager () {
    if (process.platform !== 'linux') {
      return Promise.resolve(Platform.PACKAGE_MANAGERS.UNKNOWN)
    }

    if (this.installMethod === 'snap') {
      return Promise.resolve(Platform.PACKAGE_MANAGERS.SNAP)
    } else if (this.installMethod === 'deb' || this.installMethod === 'rpm') {
      return new Promise((resolve) => {
        getos((err, info) => {
          if (!err) {
            const manager = LINUX_PACKAGE_MANGER_BY_OS_NAME[info.dist]
            if (this.installMethod === 'deb') {
              if (manager === Platform.PACKAGE_MANAGERS.APT) {
                return resolve(manager)
              }
            } else if (this.installMethod === 'rpm') {
              if (manager === Platform.PACKAGE_MANAGERS.YUM || manager === Platform.PACKAGE_MANAGERS.ZYPPER) {
                return resolve(manager)
              }
            }
          }
          resolve(Platform.PACKAGE_MANAGERS.UNKNOWN)
        })
      })
    } else {
      return Promise.resolve(Platform.PACKAGE_MANAGERS.UNKNOWN)
    }
  }
}

export default new DistributionConfig()
