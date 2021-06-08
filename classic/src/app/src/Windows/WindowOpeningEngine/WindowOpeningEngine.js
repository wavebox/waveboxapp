import WindowOpeningRules from './WindowOpeningRules'
import WindowOpeningMatchTask from './WindowOpeningMatchTask'
import CRExtensionManager from 'Extensions/Chrome/CRExtensionManager'
import CRExtensionManifestWavebox from 'shared/Models/CRExtension/CRExtensionManifestWavebox'
import { URL } from 'url'
import fallbackConfig from './fallbackConfig'
import { CRExtensionWebPreferences } from 'WebContentsManager'
import {
  WAVEBOX_CAPTURE_URL_PREFIX,
  WAVEBOX_CAPTURE_URL_HOSTNAMES
} from 'shared/constants'
import { WINDOW_OPEN_MODES, NAVIGATE_MODES } from './WindowOpeningModes'
import { userStore } from 'stores/user'

const privWindowOpenRules = Symbol('privWindowOpenRules')
const privNavigateRules = Symbol('privNavigateRules')
const privLoadedWireConfigVersion = Symbol('privLoadedWireConfigVersion')

class WindowOpeningEngine {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWindowOpenRules] = undefined
    this[privNavigateRules] = undefined
    this[privLoadedWireConfigVersion] = undefined

    this.populateRulesets()
    userStore.listen(this.populateRulesets)
  }

  /* ****************************************************************************/
  // Data handlers
  /* ****************************************************************************/

  /**
  * Populates the rulesets from the user store
  * @param userState=autoget: the user state
  */
  populateRulesets = (userState = userStore.getState()) => {
    const version = userState.wireConfigVersion()
    if (this[privLoadedWireConfigVersion] === userState.wireConfigVersion()) {
      return
    }

    const windowOpenRules = userState.wireConfigWindowOpenRules(fallbackConfig.windowOpen)
    const navigateRules = userState.wireConfigNavigateRules(fallbackConfig.navigate)
    this[privWindowOpenRules] = new WindowOpeningRules(version, windowOpenRules)
    this[privNavigateRules] = new WindowOpeningRules(version, navigateRules)
    this[privLoadedWireConfigVersion] = version
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
    const config = this[privWindowOpenRules].getMatchingRuleConfig(matchTask)
    if (config.match && WINDOW_OPEN_MODES[config.mode]) {
      return config
    } else {
      return {
        match: false,
        mode: WINDOW_OPEN_MODES.DEFAULT,
        ignoreUserCommandKeyModifier: false
      }
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
      new URL(targetUrl),
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
          partitionOverride: extensionPopoutConfig.extension.manifest.hasBackground ? CRExtensionWebPreferences.partitionIdForExtension(extensionPopoutConfig.extension.id) : undefined
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
    const purl = new URL(targetUrl)
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
    const config = this[privNavigateRules].getMatchingRuleConfig(matchTask)
    if (config.match && NAVIGATE_MODES[config.mode]) {
      return config
    } else {
      return {
        match: false,
        mode: NAVIGATE_MODES.DEFAULT,
        ignoreUserCommandKeyModifier: false
      }
    }
  }
}

export default new WindowOpeningEngine()
