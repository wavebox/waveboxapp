import { ipcRenderer, webFrame } from 'electron'
import AdaptorRegistry from './AdaptorRegistry'
import { WCRPC_DOM_READY } from 'shared/webContentsRPC'
import url from 'url'
import {ExtensionLoader} from 'Browser'

const privHasStarted = Symbol('privHasStarted')
const privRunningAdaptors = Symbol('privRunningAdaptors')

class AdaptorLoader {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Matches a pattern against a url
  * @param protocol: the url protocol
  * @param host: the url host
  * @param pathname: the url pathname
  * @param pattern: the pattern to match against
  * @return true if there is a match, false otherwise
  */
  static matchUrl (protocol, host, pathname, pattern) {
    const regexp = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$')
    const url = `${protocol}//${host}${pathname}`
    return url.match(regexp) !== null
  }

  /**
  * Version of matchUrl which accepts multiple patterns
  * @return true if there is a match, false otherwise
  */
  static matchUrls (protocol, host, pathname, patterns) {
    return !!patterns.find((pattern) => {
      return this.matchUrl(protocol, host, pathname, pattern)
    })
  }

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
      this._loadAdaptor(url.parse(window.location.href))
    } else {
      // Defer loading of about:blank
      ipcRenderer.once(WCRPC_DOM_READY, () => {
        this._loadAdaptor(url.parse(window.location.href))
      })
    }
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Loads the adaptor
  * @param parsedUrl { host, protocol, pathname }: the host that we're running on
  */
  _loadAdaptor ({ protocol, host, pathname }) {
    const matched = AdaptorRegistry.filter((Adaptor) => {
      return this.constructor.matchUrls(protocol, host, pathname, Adaptor.matches)
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
