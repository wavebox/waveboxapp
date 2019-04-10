import UrlPattern from 'url-pattern'
import WBRPCRenderer from 'shared/WBRPCRenderer'
import IEngineRuntime from './IEngineRuntime'
import LiveConfig from 'LiveConfig'

const privHasStarted = Symbol('privHasStarted')
const privRuntime = Symbol('privRuntime')

class IEngine {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this[privHasStarted] = false
    this[privRuntime] = undefined
  }

  /**
  * Starts the adaptor
  */
  start () {
    if (this[privHasStarted]) { return }
    this[privHasStarted] = true

    if (window.location.href !== 'about:blank') {
      this._loadIEngine(window.location.href)
    } else {
      // Defer loading of about:blank
      WBRPCRenderer.webContents.once('dom-ready', () => {
        this._loadIEngine(window.location.href)
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
  _loadIEngine (targetUrl) {
    const manifest = LiveConfig.iEngine
    if (!manifest) { return }

    const shouldStart = (Array.isArray(manifest.matches) ? manifest.matches : [])
      .find((patternStr) => {
        const pattern = new UrlPattern(patternStr)
        return pattern.match(targetUrl) !== null
      }
      ) !== undefined
    if (!shouldStart) { return }
    this[privRuntime] = new IEngineRuntime(manifest)
  }
}

export default IEngine
