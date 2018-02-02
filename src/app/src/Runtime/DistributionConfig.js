import fs from 'fs-extra'
import path from 'path'

class DistributionConfig {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.cache = undefined
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  load () {
    if (this.cache === undefined) {
      console.log('load DC')
      try {
        this.cache = fs.readJsonSync(path.join(__dirname, './distributionConfig.json'))
      } catch (ex) {
        this.cache = {}
      }
      console.log(this.cache)
    }
    return this.cache
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get installMethod () { return this.load().installMethod || 'unknown' }
  get isSnapInstall () { return process.platform === 'linux' && this.installMethod === 'snap' }
  get isDebInstall () { return process.platform === 'linux' && this.installMethod === 'deb' }
}

export default new DistributionConfig()
