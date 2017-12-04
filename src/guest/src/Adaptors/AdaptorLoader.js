import { ipcRenderer, webFrame } from 'electron'
import AdaptorRegistry from './AdaptorRegistry'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'
import {ExtensionLoader} from 'Browser'
import UrlPattern from 'url-pattern'

const privHasStarted = Symbol('privHasStarted')
const privRunningAdaptors = Symbol('privRunningAdaptors')

class AdaptorLoader {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privHasStarted] = false
    this[privRunningAdaptors] = []
  }

  /**
  * Starts the adaptor
  */
  start () {
    if (this[privHasStarted]) { return }
    this[privHasStarted] = true

    if (window.location.href !== 'about:blank') {
      this._loadAdaptor(window.location.href)
    } else {
      // Defer loading of about:blank
      ipcRenderer.once(WCRPC_DOM_READY, () => {
        this._loadAdaptor(window.location.href)
      })
    }
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the adaptor
  * @param targetUrl: the url to load for
  */
  _loadAdaptor (targetUrl) {
    const matched = AdaptorRegistry.filter((Adaptor) => {
      const match = Adaptor.matches.find((patternStr) => {
        const pattern = new UrlPattern(patternStr)
        return pattern.match(targetUrl) !== null
      })
      return match !== undefined
    })

    if (matched.length) {
      matched.forEach((Adaptor) => {
        this._executeAdaptor(Adaptor)
      })
    }
  }

  /**
  * Executes an adatpor
  * @param Adaptor: the adaptor to execute
  */
  _executeAdaptor (Adaptor) {
    let runtimeAdaptor

    // Run noninteractive first
    if (Adaptor.hasStyles) {
      if (!runtimeAdaptor) { runtimeAdaptor = Adaptor }
      webFrame.insertCSS(runtimeAdaptor.styles)
    }
    if (Adaptor.hasGuestApis) {
      if (!runtimeAdaptor) { runtimeAdaptor = Adaptor }
      runtimeAdaptor.guestApis.forEach((api) => {
        ExtensionLoader.loadWaveboxGuestApi(api)
      })
    }

    // Run interactive second
    if (Adaptor.hasJS) {
      if (!runtimeAdaptor || !runtimeAdaptor.isInteractive) { runtimeAdaptor = new Adaptor() }
      runtimeAdaptor.executeJS()
    }

    // Save
    if (runtimeAdaptor) {
      this[privRunningAdaptors].push(runtimeAdaptor)
    }
  }
}

export default AdaptorLoader
