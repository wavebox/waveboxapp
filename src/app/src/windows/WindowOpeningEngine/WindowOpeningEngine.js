import WindowOpeningRules from './WindowOpeningRules'
import WindowOpeningMatchTask from './WindowOpeningMatchTask'
import CRExtensionManager from 'Extensions/Chrome/CRExtensionManager'
import CRExtensionManifestWavebox from 'shared/Models/CRExtension/CRExtensionManifestWavebox'
import url from 'url'
import fallbackConfig from './fallbackConfig'
import {
  CR_EXTENSION_BG_PARTITION_PREFIX
} from 'shared/extensionApis'
import {
  WAVEBOX_CAPTURE_URL_PREFIX,
  WAVEBOX_CAPTURE_URL_HOSTNAMES
} from 'shared/constants'
import userStore from 'stores/userStore'

const WINDOW_OPEN_MODES = Object.freeze({
  CONTENT: 'CONTENT',
  CONTENT_PROVSIONAL: 'CONTENT_PROVSIONAL',
  POPUP_CONTENT: 'POPUP_CONTENT',
  EXTERNAL: 'EXTERNAL',
  EXTERNAL_PROVSIONAL: 'EXTERNAL_PROVSIONAL',
  DEFAULT: 'DEFAULT',
  DEFAULT_IMPORTANT: 'DEFAULT_IMPORTANT',
  DEFAULT_PROVISIONAL: 'DEFAULT_PROVISIONAL',
  DEFAULT_PROVISIONAL_IMPORTANT: 'DEFAULT_PROVISIONAL_IMPORTANT',
  DOWNLOAD: 'DOWNLOAD',
  SUPPRESS: 'SUPPRESS'
})

const NAVIGATE_MODES = Object.freeze({
  DEFAULT: 'DEFAULT',
  SUPPRESS: 'SUPPRESS',
  OPEN_EXTERNAL: 'OPEN_EXTERNAL',
  OPEN_CONTENT: 'OPEN_CONTENT',
  OPEN_CONTENT_RESET: 'OPEN_CONTENT_RESET'
})

const privWindowOpenRules = Symbol('privWindowOpenRules')
const privNavigateRules = Symbol('privNavigateRules')

class WindowOpeningEngine {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWindowOpenRules] = undefined
    this[privNavigateRules] = undefined
    this.populateRulesets()
    userStore.on('changed:WIRE_CONFIG', this.populateRulesets)
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get WINDOW_OPEN_MODES () { return WINDOW_OPEN_MODES }
  get NAVIGATE_MODES () { return NAVIGATE_MODES }

  /* ****************************************************************************/
  // Data handlers
  /* ****************************************************************************/

  /**
  * Populates the rulesets from the user store
  */
  populateRulesets = () => {
    const version = (userStore.wireConfig || {}).version || '0.0.0'
    const windowOpenRules = (userStore.wireConfig || {}).windowOpen || fallbackConfig.windowOpen
    const navigateRules = (userStore.wireConfig || {}).navigate || fallbackConfig.navigate

    this[privWindowOpenRules] = new WindowOpeningRules(version, windowOpenRules)
    this[privNavigateRules] = new WindowOpeningRules(version, navigateRules)
  }

  /* ****************************************************************************/
  // Window.open events
  /* ****************************************************************************/

  /**
  * Gets a sanitized rule for opening the given config
  * @param currentUrl: the current url the page is on
  * @param targetUrl: the target url we are trying to open
  * @param provisionalTargetUrl: the url the user is hovering over as defined by the browser
  * @param disposition: the new window disposition
  * @return a WINDOW_OPEN_MODES
  */
  getRuleForWindowOpen (currentUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition) {
    const matchTask = new WindowOpeningMatchTask(currentUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition)
    const mode = this[privWindowOpenRules].getMatchingMode(matchTask)
    if (mode && WINDOW_OPEN_MODES[mode]) {
      return mode
    } else {
      return WINDOW_OPEN_MODES.DEFAULT
    }
  }

  /**
  * Gets the extension rule for opening a window
  * @param webContentsId: the id of the webcontents that's opening
  * @param targetUrl: the target url we are trying to open
  * @param disposition: the new window disposition
  * @return { match:true|false, config:{}, mode:WINDOW_OPEN_MODES, paritionOverride:partition|undefined}
  */
  getExtensionRuleForWindowOpen (webContentsId, targetUrl, disposition) {
    const extensionPopoutConfig = CRExtensionManager.runtimeHandler.getWindowPopoutModePreference(
      webContentsId,
      targetUrl,
      url.parse(targetUrl, true),
      disposition
    )

    if (extensionPopoutConfig !== false) {
      if (extensionPopoutConfig.mode === CRExtensionManifestWavebox.POPOUT_WINDOW_MODES.POPOUT) {
        return {
          match: true,
          config: extensionPopoutConfig,
          mode: WINDOW_OPEN_MODES.POPUP_CONTENT
        }
      } else if (extensionPopoutConfig.mode === CRExtensionManifestWavebox.POPOUT_WINDOW_MODES.CONTENT) {
        return {
          match: true,
          config: extensionPopoutConfig,
          mode: WINDOW_OPEN_MODES.CONTENT
        }
      } else if (extensionPopoutConfig.mode === CRExtensionManifestWavebox.POPOUT_WINDOW_MODES.CONTENT_BACKGROUND) {
        return {
          match: true,
          config: extensionPopoutConfig,
          mode: WINDOW_OPEN_MODES.CONTENT,
          partitionOverride: extensionPopoutConfig.extension.manifest.hasBackground ? `${CR_EXTENSION_BG_PARTITION_PREFIX}${extensionPopoutConfig.extension.id}` : undefined
        }
      }
    }

    return { match: false }
  }

  /**
  * Looks to see if we should always ignore the open request
  * @param targetUrl: the target url to open
  * @return true if we should ignore, false otherwise
  */
  shouldAlwaysIgnoreWindowOpen (targetUrl) {
    const purl = url.parse(targetUrl, true)
    if (WAVEBOX_CAPTURE_URL_HOSTNAMES.indexOf(purl.hostname) !== -1 && purl.pathname.startsWith(WAVEBOX_CAPTURE_URL_PREFIX)) { return true }
    return false
  }

  /* ****************************************************************************/
  // Navigation events
  /* ****************************************************************************/

  /**
  * Gets a santized rule for navigating
  * @param currentUrl: the current url the page is on
  * @param targetUrl: the target url we are trying to navigate to
  * @param openingWindowType: the type of window that's trying to open
  * @return a NAVIGATE_MODES
  */
  getRuleForNavigation (currentUrl, targetUrl, openingWindowType) {
    const matchTask = new WindowOpeningMatchTask(currentUrl, targetUrl, openingWindowType)
    const mode = this[privNavigateRules].getMatchingMode(matchTask)
    if (mode && NAVIGATE_MODES[mode]) {
      return mode
    } else {
      return NAVIGATE_MODES.DEFAULT
    }
  }
}

export default new WindowOpeningEngine()
