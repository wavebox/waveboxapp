import pkg from 'package.json'
import semver from 'semver'
import IEngineLoader from './IEngineLoader'
import IEngineAuthWindowTask from './IEngineAuthWindowTask'

const privTask = Symbol('privTask')

class IEngineAuthRuntime {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privTask] = undefined
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Starts a new service auth in a window
  * @param engineType: the iengine type
  * @param partitionId: the id of the partition to use
  * @param authMode: the auth mode
  * @return promise
  */
  startAuthWindow (engineType, partitionId, authMode) {
    return new Promise((resolve, reject) => {
      if (this[privTask]) {
        this[privTask].forceFinish()
        this[privTask] = undefined
      }

      let EngineModule
      try {
        EngineModule = IEngineLoader.loadModuleSync(engineType, 'auth.js')
      } catch (ex) {
        return reject(new Error('Failed to load auth module'))
      }

      this[privTask] = new IEngineAuthWindowTask(
        engineType,
        EngineModule,
        partitionId,
        (err, success) => {
          this[privTask] = undefined
          if (err) {
            reject(err)
          } else {
            resolve(success)
          }
        }
      )
    })
  }

  /* **************************************************************************/
  // Support
  /* **************************************************************************/

  /**
  * @param adaptor: the adaptor to check
  * @return true if the adaptor needs an auth window and we support it
  */
  adaptorUsesAuthWindow (adaptor) {
    return adaptor.usesAuthWindow === true || semver.satisfies(pkg.version, adaptor.usesAuthWindow)
  }

  /**
  * @param adaptor: the adaptor to check
  * @return true if the adaptor requires a cookie clear on reauth
  */
  adaptorClearsCookiesOnReauthenticate (adaptor) {
    return adaptor.clearCookiesOnReauthenticate === true || semver.satisfies(pkg.version, adaptor.clearCookiesOnReauthenticate)
  }
}

export default IEngineAuthRuntime
