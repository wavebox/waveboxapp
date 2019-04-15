import pkg from 'package.json'
import semver from 'semver'
import IEngineLoader from './IEngineLoader'
import IEngineAuthWindowApi from './IEngineAuthWindowApi'
import AuthWindow from 'Windows/AuthWindow'
import { SessionManager } from 'SessionManager'
import { userStore } from 'stores/user'
import Resolver from 'Runtime/Resolver'

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
  * @return promise
  */
  startAuthWindow (engineType, partitionId) {
    return new Promise((resolve, reject) => {
      if (this[privTask]) {
        this[privTask].forceFinish()
        this[privTask] = undefined
      }

      // Create some top level vars
      let userClosed = true
      let hasResolved = false
      let authWindow
      let handleBeforeRequest
      let handleHeadersReceived
      let handleApiAuthSuccess
      let handleApiAuthFailure

      // Create the api
      const api = new IEngineAuthWindowApi()
      handleApiAuthSuccess = (data) => {
        userClosed = false
        if (!hasResolved) {
          hasResolved = true
          resolve(data)
        }
        if (authWindow) { authWindow.close() }
      }
      api.on('auth-success', handleApiAuthSuccess)
      handleApiAuthFailure = (ex) => {
        userClosed = false
        if (!hasResolved) {
          hasResolved = true
          reject(ex)
        }
        if (authWindow) { authWindow.close() }
      }
      api.on('auth-failure', handleApiAuthFailure)

      // Load the engine auth
      let engineAuth
      try {
        const Module = IEngineLoader.loadModuleSync(engineType, 'auth.js')
        engineAuth = new Module(api)
      } catch (ex) {
        return reject(new Error('Failed to load auth module'))
      }

      // Create the window
      const emitter = SessionManager.webRequestEmitterFromPartitionId(partitionId)
      authWindow = this._createAuthWindow(engineAuth, partitionId)
      const authWindowTabId = authWindow.window.webContents.id
      authWindow.on('closed', () => {
        if (handleBeforeRequest) {
          emitter.beforeRequest.removeListener(handleBeforeRequest)
        }
        if (handleHeadersReceived) {
          emitter.headersReceived.removeListener(handleHeadersReceived)
        }
        if (handleApiAuthSuccess) {
          api.removeListener('auth-success', handleApiAuthSuccess)
        }
        if (handleApiAuthFailure) {
          api.removeListener('auth-failure', handleApiAuthFailure)
        }

        if (!hasResolved) {
          hasResolved = true
          reject(new Error(userClosed ? 'User closed' : 'Failure'))
        }
        authWindow = undefined
        this[privTask] = undefined
      })

      // Bind network event listeners
      handleBeforeRequest = (details, responder) => {
        if (details.webContentsId !== authWindowTabId) { return responder({}) }
        if (details.resourceType !== 'mainFrame') { return responder({}) }
        let defaultPrevented = false
        engineAuth.onMainFrameBeforeRequest({
          preventDefault: () => { defaultPrevented = true }
        }, details)
        return responder(defaultPrevented ? { cancel: true } : {})
      }
      emitter.beforeRequest.onBlocking(undefined, handleBeforeRequest)

      handleHeadersReceived = (details, responder) => {
        if (details.webContentsId !== authWindowTabId) { return responder({}) }
        if (details.resourceType !== 'mainFrame') { return responder({}) }
        let defaultPrevented = false
        engineAuth.onMainFrameHeadersReceived({
          preventDefault: () => { defaultPrevented = true }
        }, details)
        return responder(defaultPrevented ? { cancel: true } : {})
      }
      emitter.headersReceived.onBlocking(undefined, handleHeadersReceived)

      // Prepare for others to kill us
      this[privTask] = {
        forceFinish: () => {
          userClosed = false
          if (authWindow) {
            authWindow.close()
          }
        }
      }
    })
  }

  /**
  * Creates the auth window
  * @param engineAuth: the engine auth module
  * @param partitionId: the partition id to run for
  * @return the auth window
  */
  _createAuthWindow (engineAuth, partitionId) {
    const userState = userStore.getState()
    const initialUrl = engineAuth.getInitialUrl(
      {},
      { clientId: userState.clientId, clientToken: userState.clientToken }
    )
    const windowSettings = engineAuth.getWindowSettings()

    const authWindow = new AuthWindow()
    authWindow.create(initialUrl, {
      useContentSize: true,
      center: true,
      show: true,
      resizable: false,
      standardWindow: true,
      autoHideMenuBar: true,
      ...windowSettings,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        nativeWindowOpen: true,
        sharedSiteInstances: true,
        partition: partitionId,
        preload: Resolver.guestPreload(),
        preloadCrx: Resolver.crExtensionApi()
      }
    })
    return authWindow
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
}

export default IEngineAuthRuntime
