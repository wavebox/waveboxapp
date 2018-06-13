import os from 'os'
import { execSync } from 'child_process'

const privMachineName = Symbol('privMachineName')

class MachineInfo {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privMachineName] = null
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get humanizedName () {
    if (this[privMachineName] === null) {
      if (process.platform === 'darwin') {
        try {
          this[privMachineName] = execSync('scutil --get ComputerName').toString().trim() || os.hostname()
        } catch (ex) {
          this[privMachineName] = os.hostname()
        }
      } else if (process.platform === 'linux') {
        this[privMachineName] = os.hostname()
      } else if (process.platform === 'win32') {
        this[privMachineName] = process.env.COMPUTERNAME || os.hostname()
      } else {
        this[privMachineName] = ''
      }
    }

    return this[privMachineName]
  }

  get humanizedOSName () {
    switch (process.platform) {
      case 'darwin': return 'macOS'
      case 'linux': return 'Linux'
      case 'win32': return 'Windows'
    }
  }
}

export default new MachineInfo()
