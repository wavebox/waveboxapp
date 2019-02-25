import { ipcMain, shell, app, dialog, clipboard } from 'electron'
import { settingsStore } from 'stores/settings'
import { emblinkActions } from 'stores/emblink'
import WindowOpeningEngine from './WindowOpeningEngine'
import WindowOpeningRules from './WindowOpeningRules'
import WindowOpeningMatchTask from './WindowOpeningMatchTask'
import WINDOW_BACKING_TYPES from '../WindowBackingTypes'
import accountStore from 'stores/account/accountStore'
import { WINDOW_OPEN_MODES, NAVIGATE_MODES } from './WindowOpeningModes'
import { WB_USER_RECORD_NEXT_WINDOW_OPEN_EVENT } from 'shared/ipcEvents'
import WaveboxAppCommandKeyTracker from 'WaveboxApp/WaveboxAppCommandKeyTracker'
import { OSSettings } from 'shared/Models/Settings'
import WindowOpeningOpeners from './WindowOpeningOpeners'

const privWindowOpeningOpeners = Symbol('privWindowOpeningOpeners')
const privRecordOpenEvent = Symbol('privRecordOpenEvent')

class WindowOpeningHandler {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privWindowOpeningOpeners] = new WindowOpeningOpeners()
    this[privRecordOpenEvent] = false

    ipcMain.on(WB_USER_RECORD_NEXT_WINDOW_OPEN_EVENT, () => { this[privRecordOpenEvent] = true })
  }

  /* ****************************************************************************/
  // Window.open handlers
  /* ****************************************************************************/

  /**
  * Handles a new window being requested
  * @param evt: the event that fired
  * @param config: the config for opening
  *     @param targetUrl: the webview url
  *     @param frameName: the name of the frame
  *     @param disposition: the frame disposition
  *     @param options: the browser window options
  *     @param additionalFeatures: The non-standard features
  *     @param openingBrowserWindow: the browser window that's opening
  *     @param openingWindowType: the type of window that's opening
  *     @param tabMetaInfo=undefined: the meta info to provide the new tab with
  *     @param provisionalTargetUrl=undefined: the provisional target url the user is hovering over
  * @param defaultOpenMode=EXTERNAL: the default open mode if no rules match
  */
  handleOpenNewWindow (evt, config, defaultOpenMode = WINDOW_OPEN_MODES.EXTERNAL) {
    evt.preventDefault()

    // Grab some info about our opener
    const {
      targetUrl,
      disposition,
      options,
      openingBrowserWindow,
      openingWindowType,
      tabMetaInfo,
      provisionalTargetUrl
    } = config
    const settingsState = settingsStore.getState()

    // If we don't have options we're in an undefined state and shouldn't link the new window
    // via the options. Quit and do nothing
    if (!options) { return }

    // Capture internal navigations
    if (this._handleInternalNavigation(targetUrl)) {
      evt.preventDefault()
      return
    }

    // Grab our state
    const webContentsId = evt.sender.id
    const currentUrl = evt.sender.getURL()
    const currentHostUrl = this._getCurrentHostUrl(evt.sender.getURL(), tabMetaInfo)
    const mailbox = this._getMailboxFromTabMetaInfo(tabMetaInfo)

    // Check for some urls to never handle
    if (WindowOpeningEngine.shouldAlwaysIgnoreWindowOpen(targetUrl)) { return }

    // Check if the kill-switch is set for this
    if (settingsState.app.enableWindowOpeningEngine === false) {
      this[privWindowOpeningOpeners].openWindowExternal(openingBrowserWindow, targetUrl)
      return
    }

    // Setup our state
    let openMode = defaultOpenMode
    let partitionOverride

    // Run through our standard config
    try {
      const mode = WindowOpeningEngine.getRuleForWindowOpen(currentHostUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition)
      if (mode && WINDOW_OPEN_MODES[mode]) {
        openMode = mode
      }
    } catch (ex) {
      console.error(`Failed to process default window opening rules. Continuing with "${openMode}" behaviour...`, ex)
    }

    // Look to see if the mailbox has an override
    if (mailbox) {
      const mailboxRulesets = mailbox.windowOpenModeOverrideRulesets
      if (Array.isArray(mailboxRulesets) && mailboxRulesets.length) {
        try {
          // Create a transient match task and ruleset to test matching
          const matchTask = new WindowOpeningMatchTask(currentHostUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition)
          const rules = new WindowOpeningRules(0, mailboxRulesets)
          const mode = rules.getMatchingMode(matchTask)
          if (mode && WINDOW_OPEN_MODES[mode]) {
            openMode = mode
          }
        } catch (ex) {
          console.error(`Failed to process mailbox "${mailbox.id}" window opening rules. Continuing with "${openMode}" behaviour...`, ex)
        }
      }
    }

    // Check installed extensions to see if they overwrite the behaviour
    let extensionRule
    try {
      extensionRule = WindowOpeningEngine.getExtensionRuleForWindowOpen(webContentsId, targetUrl, disposition)
      if (extensionRule.match) {
        openMode = extensionRule.mode
        partitionOverride = extensionRule.partitionOverride
      }
    } catch (ex) {
      console.error(`Failed to process extension window opening rules. Continuing with "${openMode}" behaviour...`, ex)
    }

    // Look to see if the user wants to overwrite the behaviour
    const preAppCommandOpenUrl = this._getNewWindowUrlFromMode(openMode, targetUrl, provisionalTargetUrl)
    if (WaveboxAppCommandKeyTracker.shiftPressed) {
      openMode = this._commandLinkBehaviourToOpenMode(openMode, settingsState.os.linkBehaviourWithShift)
    }
    if (WaveboxAppCommandKeyTracker.commandOrControlPressed) {
      openMode = this._commandLinkBehaviourToOpenMode(openMode, settingsState.os.linkBehaviourWithCmdOrCtrl)
    }

    // Update the tab meta data
    const saltedTabMetaInfo = this._autosaltTabMetaInfo(tabMetaInfo, currentUrl, webContentsId)
    const openUrl = this._getNewWindowUrlFromMode(openMode, targetUrl, provisionalTargetUrl)

    // Action the window open
    switch (openMode) {
      case WINDOW_OPEN_MODES.POPUP_CONTENT:
        const openedWindow = this[privWindowOpeningOpeners].openWindowWaveboxPopupContent(openingBrowserWindow, saltedTabMetaInfo, openUrl, options)
        evt.newGuest = openedWindow.window
        break
      case WINDOW_OPEN_MODES.EXTERNAL:
      case WINDOW_OPEN_MODES.EXTERNAL_PROVISIONAL:
        this[privWindowOpeningOpeners].openWindowExternal(openingBrowserWindow, openUrl)
        break
      case WINDOW_OPEN_MODES.DEFAULT:
      case WINDOW_OPEN_MODES.DEFAULT_IMPORTANT:
      case WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL:
      case WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL_IMPORTANT:
        this[privWindowOpeningOpeners].openWindowDefault(openingBrowserWindow, saltedTabMetaInfo, mailbox, openUrl, options, partitionOverride)
        break
      case WINDOW_OPEN_MODES.CONTENT:
      case WINDOW_OPEN_MODES.CONTENT_PROVISIONAL:
        this[privWindowOpeningOpeners].openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, openUrl, options, partitionOverride)
        break
      case WINDOW_OPEN_MODES.DOWNLOAD:
        evt.sender.downloadURL(openUrl)
        break
      case WINDOW_OPEN_MODES.CURRENT:
      case WINDOW_OPEN_MODES.CURRENT_PROVISIONAL:
        evt.sender.loadURL(openUrl)
        break
      case WINDOW_OPEN_MODES.BLANK_AND_CURRENT:
      case WINDOW_OPEN_MODES.BLANK_AND_CURRENT_PROVISIONAL:
        evt.sender.loadURL('about:blank')
        evt.sender.loadURL(openUrl)
        break
      case WINDOW_OPEN_MODES.SUPPRESS:
        /* no-op */
        break
      case WINDOW_OPEN_MODES.ASK_USER:
        // When we ask the user, we can gleem some info about the url from the original open mode we served
        this[privWindowOpeningOpeners].askUserForWindowOpenTarget(openingBrowserWindow, saltedTabMetaInfo, mailbox, preAppCommandOpenUrl, options, partitionOverride, true)
        break
      default:
        this[privWindowOpeningOpeners].openWindowExternal(openingBrowserWindow, openUrl)
        break
    }

    // If the user wanted to record this, output the info
    if (this[privRecordOpenEvent]) {
      this[privRecordOpenEvent] = false
      const openEvt = {
        targetUrl: targetUrl,
        provisionalTargetUrl: provisionalTargetUrl,
        currentUrl: currentUrl,
        currentHostUrl: currentHostUrl,
        disposition: disposition,
        openingWindowType: openingWindowType,
        shiftPressed: WaveboxAppCommandKeyTracker.shiftPressed,
        commandOrControlPressed: WaveboxAppCommandKeyTracker.commandOrControlPressed,
        platform: process.platform,
        openMode: openMode
      }
      console.log('Window open event', openEvt)
      dialog.showMessageBox({
        type: 'info',
        buttons: [
          'Done',
          'Copy full info to clipboard'
        ],
        defaultId: 0,
        title: 'Window open event',
        message: [
          `Window open event info...`,
          ''
        ].concat(
          Object.keys(openEvt).reduce((acc, k) => {
            const v = `${openEvt[k]}`
            return acc.concat(`${k}: ${v.length > 25 ? `${v.substr(0, 25)}...` : v}`)
          }, [])
        ).join('\n')
      }, (opt) => {
        if (opt === 1) {
          clipboard.writeText(JSON.stringify(openEvt, null, 2))
        }
      })
    }
  }

  /**
  * Gets the url to open from the target url and provisional target url
  * @param openMode: the open mode
  * @param targetUrl: the current target url
  * @param provisionalTargetUrl: the current provisional target url
  * @return either the targetUrl or provisionalTargetUrl
  */
  _getNewWindowUrlFromMode (openMode, targetUrl, provisionalTargetUrl) {
    switch (openMode) {
      case WINDOW_OPEN_MODES.EXTERNAL_PROVISIONAL:
      case WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL:
      case WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL_IMPORTANT:
      case WINDOW_OPEN_MODES.CONTENT_PROVISIONAL:
      case WINDOW_OPEN_MODES.CURRENT_PROVISIONAL:
      case WINDOW_OPEN_MODES.BLANK_AND_CURRENT_PROVISIONAL:
        return provisionalTargetUrl
      default:
        return targetUrl
    }
  }

  /* ****************************************************************************/
  // Window navigation handlers
  /* ****************************************************************************/

  /**
  * Handles a before navigation event
  * @param evt: the event that fired
  * @param config: the config for opening
  *     @param targetUrl: the webview url
  *     @param openingBrowserWindow: the browser window that's opening
  *     @param openingWindowType: the type of window that's opening
  *     @param tabMetaInfo=undefined: the meta info to provide the new tab with
  */
  handleWillNavigate (evt, config) {
    // Grab some info about our opener
    const {
      targetUrl,
      openingBrowserWindow,
      openingWindowType,
      tabMetaInfo
    } = config

    // Capture internal navigations
    if (this._handleInternalNavigation(targetUrl)) {
      evt.preventDefault()
      return
    }

    // Grab our state
    const webContentsId = evt.sender.id
    const currentUrl = evt.sender.getURL()
    const currentHostUrl = this._getCurrentHostUrl(evt.sender.getURL(), tabMetaInfo)
    const mailbox = this._getMailboxFromTabMetaInfo(tabMetaInfo)
    let navigateMode = NAVIGATE_MODES.DEFAULT

    // Run through our standard config
    try {
      const mode = WindowOpeningEngine.getRuleForNavigation(currentHostUrl, targetUrl, openingWindowType)
      if (navigateMode && NAVIGATE_MODES[mode]) {
        navigateMode = mode
      }
    } catch (ex) {
      console.error(`Failed to process default navigate rules. Continuing with "${navigateMode}" behaviour...`, ex)
    }

    // Look to see if the mailbox has an override
    if (mailbox) {
      const mailboxRulesets = mailbox.navigateModeOverrideRulesets
      if (Array.isArray(mailboxRulesets) && mailboxRulesets.length) {
        try {
          // Create a transient match task and ruleset to test matching
          const matchTask = new WindowOpeningMatchTask(currentHostUrl, targetUrl, openingWindowType)
          const rules = new WindowOpeningRules(0, mailboxRulesets)
          const mode = rules.getMatchingMode(matchTask)
          if (mode && NAVIGATE_MODES[mode]) {
            navigateMode = mode
          }
        } catch (ex) {
          console.error(`Failed to process mailbox "${mailbox.id}" window navigate rules. Continuing with "${navigateMode}" behaviour...`, ex)
        }
      }
    }

    if (navigateMode !== NAVIGATE_MODES.DEFAULT) {
      // Generate extra state data
      const saltedTabMetaInfo = this._autosaltTabMetaInfo(tabMetaInfo, currentUrl, webContentsId)
      const newWindowOptions = {
        webPreferences: evt.sender.getWebPreferences() || {}
      }

      if (navigateMode === NAVIGATE_MODES.SUPPRESS) {
        evt.preventDefault()
      } else if (navigateMode === NAVIGATE_MODES.OPEN_EXTERNAL) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowExternal(openingBrowserWindow, targetUrl)
      } else if (navigateMode === NAVIGATE_MODES.OPEN_CONTENT) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
      } else if (navigateMode === NAVIGATE_MODES.OPEN_CONTENT_RESET) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
        evt.sender.goToIndex(0)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_CONTENT) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
        this[privWindowOpeningOpeners].closeOpeningWindowIfSupported(evt.sender.id)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_CONTENT_POPUP) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowWaveboxPopupContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
        this[privWindowOpeningOpeners].closeOpeningWindowIfSupported(evt.sender.id)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_EXTERNAL) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowExternal(openingBrowserWindow, targetUrl)
        this[privWindowOpeningOpeners].closeOpeningWindowIfSupported(evt.sender.id)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_DEFAULT) {
        evt.preventDefault()
        this[privWindowOpeningOpeners].openWindowDefault(openingBrowserWindow, saltedTabMetaInfo, mailbox, targetUrl, newWindowOptions)
        this[privWindowOpeningOpeners].closeOpeningWindowIfSupported(evt.sender.id)
      }
    }
  }

  /**
  * Handles a did start navigation call
  * @param evt: the event that fired
  * @param config: the config for opening
  *     @param targetUrl: the webview url
  *     @param openingBrowserWindow: the browser window that's opening
  *     @param openingWindowType: the type of window that's opening
  *     @param tabMetaInfo=undefined: the meta info to provide the new tab with
  */
  handleDidStartNavigation (evt, config) {
    // Grab some info about our opener
    const { targetUrl } = config

    // This is some further workaround to https://github.com/electron/electron/issues/14751 from
    // ElectronWebContentsWillNavigateShim.
    // The only event that mailto:// links trigger is did-start-navigation. The navigation basically
    // ends in a no-op. Capture it and open it up. No need to cancel any event
    this._handleInternalNavigation(targetUrl)
  }

  /* ****************************************************************************/
  // Internal navigation
  /* ****************************************************************************/

  /**
  * Handles internal navigations
  * @param targetUrl: the url we're trying to navigate to
  * @return true if the event is handled internally, false otherwise
  */
  _handleInternalNavigation (targetUrl) {
    if (targetUrl.startsWith('mailto:')) {
      if (app.isDefaultProtocolClient('mailto')) {
        emblinkActions.composeNewMailtoLink(targetUrl)
      } else {
        shell.openExternal(targetUrl)
      }
      return true
    } else {
      return false
    }
  }

  /* ****************************************************************************/
  // Data tools
  /* ****************************************************************************/

  /**
  * Converts a command link behaviour to an open mode
  * @param openMode: the current open mode
  * @param behaviour: the behaviour to apply
  * @return the new open mode, or original open mode
  */
  _commandLinkBehaviourToOpenMode (openMode, behaviour) {
    switch (behaviour) {
      case OSSettings.COMMAND_LINK_BEHAVIOUR.BROWSER_OPEN: return WINDOW_OPEN_MODES.EXTERNAL
      case OSSettings.COMMAND_LINK_BEHAVIOUR.WAVEBOX_OPEN: return WINDOW_OPEN_MODES.CONTENT
      case OSSettings.COMMAND_LINK_BEHAVIOUR.ASK: return WINDOW_OPEN_MODES.ASK_USER
      default: return openMode
    }
  }

  /**
  * Gets the mailbox from tab meta info
  * @param tabMetaInfo: the tab meta info
  * @return the mailbox if there is one, or undefined
  */
  _getMailboxFromTabMetaInfo (tabMetaInfo) {
    if (!tabMetaInfo) { return undefined }
    if (tabMetaInfo.backing !== WINDOW_BACKING_TYPES.MAILBOX_SERVICE) { return undefined }

    const mailbox = accountStore.getState().getMailbox(tabMetaInfo.mailboxId)
    if (!mailbox) { return undefined }

    return mailbox
  }

  /**
  * Gets the current host url. If the currentUrl is about:blank will attempt to look up into
  * the opener chain to establish a url
  * @param currentUrl: the current url
  * @param tabMetaInfo: the tab meta info
  * @return the opening url or about:blank if none can be found
  */
  _getCurrentHostUrl (currentUrl, tabMetaInfo) {
    if (currentUrl && currentUrl !== 'about:blank') {
      return currentUrl
    } else if (tabMetaInfo && tabMetaInfo.opener && tabMetaInfo.opener.url) {
      return tabMetaInfo.opener.url
    } else {
      return 'about:blank'
    }
  }

  /**
  * Salts some info into the tab meta data
  * @param tabMetaInfo: the primary meta info
  * @param currentUrl: the current url of the opener
  * @param webContentsId: the current webcontents id
  * @return a salted version of the tab meta info
  */
  _autosaltTabMetaInfo (tabMetaInfo, currentUrl, webContentsId) {
    return {
      ...tabMetaInfo,
      opener: { url: currentUrl, webContentsId: webContentsId }
    }
  }
}

export default new WindowOpeningHandler()
