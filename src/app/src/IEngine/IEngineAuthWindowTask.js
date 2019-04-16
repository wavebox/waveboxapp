import IEngineAuthWindowApi from './IEngineAuthWindowApi'
import AuthWindow from 'Windows/AuthWindow'
import { SessionManager } from 'SessionManager'
import { userStore } from 'stores/user'
import Resolver from 'Runtime/Resolver'

const privUserClosed = Symbol('privUserClosed')
const privOnComplete = Symbol('privOnComplete')
const privWindow = Symbol('privWindow')
const privApi = Symbol('privApi')
const privEngineAuth = Symbol('privEngineAuth')
const privDestroyed = Symbol('privDestroyed')
const privEmitter = Symbol('privEmitter')

class IEngineAuthWindowTask {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param engineType: the iengine type
  * @param EngineModule: the engine module ready to run
  * @param partitionId: the id of the partition to use
  * @param onComplete: callback to execute on completion
  */
  constructor (engineType, EngineModule, partitionId, onComplete) {
    this[privDestroyed] = false
    this[privUserClosed] = true
    this[privOnComplete] = onComplete
    this[privEmitter] = SessionManager.webRequestEmitterFromPartitionId(partitionId)
    this[privEmitter].beforeRequest.onBlocking(undefined, this.handleBeforeRequest)
    this[privEmitter].headersReceived.onBlocking(undefined, this.handleHeadersReceived)

    this[privApi] = new IEngineAuthWindowApi()
    this[privApi].on('auth-success', this.handleApiAuthSuccess)
    this[privApi].on('auth-failure', this.handleApiAuthFailure)
    this[privApi].on('load-url', this.handleLoadUrl)
    try {
      this[privEngineAuth] = new EngineModule(this[privApi])
    } catch (ex) {
      setTimeout(() => {
        this._emitFailureOnce(new Error('Failed to load auth module'))
      })
    }

    if (this[privEngineAuth]) {
      this[privWindow] = this._createAuthWindow(this[privEngineAuth], partitionId)
      this[privWindow].on('closed', () => {
        if (this[privUserClosed]) {
          this._emitFailureOnce(new Error('User closed'))
        }
        this.destroy()
      })
    }
  }

  destroy () {
    if (this[privDestroyed]) { return }
    this[privDestroyed] = true

    this[privEmitter].beforeRequest.removeListener(this.handleBeforeRequest)
    this[privEmitter].headersReceived.removeListener(this.handleHeadersReceived)

    this[privApi].removeListener('auth-success', this.handleApiAuthSuccess)
    this[privApi].removeListener('auth-failure', this.handleApiAuthFailure)
    this[privApi].removeListener('load-url', this.handleLoadUrl)

    this[privWindow] = undefined
    this._emitFailureOnce(new Error('Unknown Error'))
  }

  /**
  * Forces the api to finish its request
  */
  forceFinish () {
    this[privUserClosed] = false
    if (this[privWindow]) {
      this[privWindow].close()
    }
  }

  /* **************************************************************************/
  // Window creators
  /* **************************************************************************/

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
  // Finish emitters
  /* **************************************************************************/

  /**
  * Emits success, call multiple times will only run once
  * @param data: the data to emit
  */
  _emitSuccessOnce (data) {
    if (this[privOnComplete]) {
      this[privOnComplete](null, data)
      this[privOnComplete] = undefined
    }
    if (this[privWindow]) {
      this[privWindow].close()
    }

    setTimeout(() => { this.destroy() }, 500)
  }

  /**
  * Emits failure, call multiple times will only run once
  * @param ex: the data to emit
  */
  _emitFailureOnce (ex) {
    if (this[privOnComplete]) {
      this[privOnComplete](ex, undefined)
      this[privOnComplete] = undefined
    }
    if (this[privWindow]) {
      this[privWindow].close()
    }
    setTimeout(() => { this.destroy() }, 500)
  }

  /* **************************************************************************/
  // API Handlers
  /* **************************************************************************/

  /**
  * Handles the api emitting a success state
  * @param data: the auth data
  */
  handleApiAuthSuccess = (data) => {
    this[privUserClosed] = false
    this._emitSuccessOnce(data)
  }

  /**
  * Handles the api emitting a failure state
  * @param ex: the error info
  */
  handleApiAuthFailure = (ex) => {
    this[privUserClosed] = false
    this._emitFailureOnce(ex)
  }

  /**
  * Handles the api requesting to load the url
  * @param targetUrl: the url to load
  */
  handleLoadUrl = (targetUrl) => {
    if (this[privWindow]) {
      this[privWindow].loadURL(targetUrl)
    }
  }

  /* **************************************************************************/
  // Session emitters
  /* **************************************************************************/

  /**
  * Handles the before request event firing
  * @param details: the request details
  * @param responder: callback responder
  */
  handleBeforeRequest = (details, responder) => {
    if (details.resourceType !== 'mainFrame') { return responder({}) }
    if (!this[privWindow]) { return responder({}) }
    if (details.webContentsId !== this[privWindow].window.webContents.id) { return responder({}) }
    if (!this[privEngineAuth]) { return responder({}) }

    let defaultPrevented = false
    this[privEngineAuth].onMainFrameBeforeRequest({
      preventDefault: () => { defaultPrevented = true }
    }, details)
    return responder(defaultPrevented ? { cancel: true } : {})
  }

  /**
  * Handles headers being received
  * @param details: the request details
  * @param responder: callback responder
  */
  handleHeadersReceived = (details, responder) => {
    if (details.resourceType !== 'mainFrame') { return responder({}) }
    if (!this[privWindow]) { return responder({}) }
    if (details.webContentsId !== this[privWindow].window.webContents.id) { return responder({}) }
    if (!this[privEngineAuth]) { return responder({}) }

    let defaultPrevented = false
    this[privEngineAuth].onMainFrameHeadersReceived({
      preventDefault: () => { defaultPrevented = true }
    }, details)
    return responder(defaultPrevented ? { cancel: true } : {})
  }
}

export default IEngineAuthWindowTask
