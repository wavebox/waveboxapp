const Model = require('../Model')
const { RELEASE_CHANNELS } = require('../../constants')

const SEARCH_PROVIDERS = {
  GOOGLE: 'GOOGLE',
  GOOGLE_WB: 'GOOGLE_WB',
  BING: 'BING',
  BING_WB: 'BING_WB',
  DUCK_DUCK: 'DUCK_DUCK',
  DUCK_DUCK_WB: 'DUCK_DUCK_WB'
}
const SEARCH_PROVIDER_NAMES = {
  [SEARCH_PROVIDERS.GOOGLE]: 'Google',
  [SEARCH_PROVIDERS.GOOGLE_WB]: 'Google',
  [SEARCH_PROVIDERS.BING]: 'Bing',
  [SEARCH_PROVIDERS.BING_WB]: 'Bing',
  [SEARCH_PROVIDERS.DUCK_DUCK]: 'Duck Duck Go',
  [SEARCH_PROVIDERS.DUCK_DUCK_WB]: 'Duck Duck Go'
}
const PROXY_MODES = {
  AUTO: 'AUTO',
  DISABLED: 'DISABLED',
  SOCKS_MANUAL: 'SOCKS_MANUAL',
  HTTP_MANUAL: 'HTTP_MANUAL'
}

class AppSettings extends Model {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UPDATE_CHANNELS () { return RELEASE_CHANNELS }
  static get SUPPORTS_MIXED_SANDBOX_MODE () { return true }
  static get SEARCH_PROVIDERS () { return SEARCH_PROVIDERS }
  static get SEARCH_PROVIDER_NAMES () { return SEARCH_PROVIDER_NAMES }
  static get PROXY_MODES () { return PROXY_MODES }

  /**
  * Generates a search provider url for a term
  * @param searchProvider: the search provider
  * @param term: the term
  * @return a url to trigger search
  */
  static generateSearchProviderUrl (searchProvider, term) {
    switch (searchProvider) {
      case SEARCH_PROVIDERS.GOOGLE:
      case SEARCH_PROVIDERS.GOOGLE_WB:
        return `https://google.com/search?q=${encodeURIComponent(term)}`
      case SEARCH_PROVIDERS.BING:
      case SEARCH_PROVIDERS.BING_WB:
        return `https://bing.com/search?q=${encodeURIComponent(term)}`
      case SEARCH_PROVIDERS.DUCK_DUCK:
      case SEARCH_PROVIDERS.DUCK_DUCK_WB:
        return `https://duckduckgo.com/?q=${encodeURIComponent(term)}`
    }
    return `https://google.com/search?q=${encodeURIComponent(term)}`
  }

  /**
  * Checks if a search provider should open in Wavebox
  * @param searchProvider: the search provider
  * @return a true to open in Wavebox, false otherwise
  */
  static searchProviderOpensInWavebox (searchProvider) {
    switch (searchProvider) {
      case SEARCH_PROVIDERS.GOOGLE_WB:
      case SEARCH_PROVIDERS.BING_WB:
      case SEARCH_PROVIDERS.DUCK_DUCK_WB:
        return true
      default:
        return false
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the user data
  * @param pkg: the current package
  */
  constructor (data, pkg) {
    super(data)
    this.__defaults__ = {
      updateChannel: pkg.releaseChannel
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', true) }
  get disableSmoothScrolling () { return this._value_('disableSmoothScrolling', false) }
  get enableUseZoomForDSF () { return this._value_('enableUseZoomForDSF', true) }
  get disableHardwareAcceleration () { return this._value_('disableHardwareAcceleration', false) }
  get checkForUpdates () { return this._value_('checkForUpdates', true) }
  get updateChannel () { return this._value_('updateChannel', this.__defaults__.updateChannel) }
  get hasSetUpdateChannel () { return this._value_('updateChannel', undefined) !== undefined }
  get hasSeenAppWizard () { return this._value_('hasSeenAppWizard', false) }
  get hasSeenOptimizeWizard () { return this._value_('hasSeenOptimizeWizard', false) }
  get hasSeenAppTour () { return this._value_('hasSeenAppTour', false) }
  get lastSeenAccountMessageUrl () { return this._value_('lastSeenAccountMessageUrl', undefined) }
  get hasSeenSnapSetupMessage () { return this._value_('hasSeenSnapSetupMessage', false) }
  get hasSeenLinuxSetupMessage () { return this._value_('hasSeenLinuxSetupMessage', false) }
  get writeMetricsLog () { return this._value_('writeMetricsLog', false) }
  get enableAutofillService () { return this._value_('enableAutofillService', true) }
  get isolateMailboxProcesses () { return this._value_('isolateMailboxProcesses', false) }
  get enableMixedSandboxMode () { return this._value_('enableMixedSandboxMode', true) }
  get enableWindowOpeningEngine () { return this._value_('enableWindowOpeningEngine', true) }
  get polyfillUserAgents () { return this._value_('polyfillUserAgents', true) }
  get concurrentServiceLoadLimit () { return this._value_('concurrentServiceLoadLimit', 0) }
  get concurrentServiceLoadLimitIsAuto () { return this.concurrentServiceLoadLimit === 0 }
  get concurrentServiceLoadLimitIsNone () { return this.concurrentServiceLoadLimit === -1 }
  get rawAppThreadFetchMicrosoftHTTP () { return this._value_('appThreadFetchMicrosoftHTTP', undefined) }
  get forceWindowPaintOnRestore () { return this._value_('forceWindowPaintOnRestore', false) }
  get showArtificiallyPersistCookies () { return this._value_('showArtificiallyPersistCookies', false) }
  get touchBarSupportEnabled () { return this._value_('touchBarSupportEnabled', false) }

  /* **************************************************************************/
  // Properties: Search
  /* **************************************************************************/

  get searchProvider () { return this._value_('searchProvider', SEARCH_PROVIDERS.GOOGLE) }
  get searchProviderOpensInWavebox () {
    return this.constructor.searchProviderOpensInWavebox(this.searchProvider)
  }

  /**
  * Generates a search provider url
  * @param term: the term to search for
  * @return a url that can be used
  */
  generateSearchProviderUrl (term) {
    return this.constructor.generateSearchProviderUrl(this.searchProvider, term)
  }

  /* **************************************************************************/
  // Properties: Network
  /* **************************************************************************/

  get proxyMode () { return this._value_('proxyMode', PROXY_MODES.AUTO) }
  get proxyServer () { return this._value_('proxyServer', '') }
  get proxyPort () { return this._value_('proxyPort', '') }
  get manualProxyString () {
    const server = this.proxyServer
    const port = this.proxyPort
    if (!server || !port) { return undefined }

    switch (this.proxyMode) {
      case PROXY_MODES.HTTP_MANUAL:
        return `${server}:${port}`
      case PROXY_MODES.SOCKS_MANUAL:
        return `socks5://${server}:${port}`
      default:
        return undefined
    }
  }
}

module.exports = AppSettings
