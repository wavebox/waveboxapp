import { shell } from 'electron'
import ContentWindow from 'Windows/ContentWindow'
import ContentPopupWindow from 'Windows/ContentPopupWindow'
import { settingsStore } from 'stores/settings'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import WindowOpeningEngine from './WindowOpeningEngine'
import WindowOpeningRules from './WindowOpeningRules'
import WindowOpeningMatchTask from './WindowOpeningMatchTask'

const WINDOW_OPEN_MODES = WindowOpeningEngine.WINDOW_OPEN_MODES

class WindowOpeningHandler {
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
  *     @param mailbox=undefined: the mailbox if any
  */
  handleOpenNewWindow (evt, config) {
    evt.preventDefault()

    const {
      targetUrl,
      disposition,
      options,
      openingBrowserWindow,
      openingWindowType,
      tabMetaInfo,
      provisionalTargetUrl,
      mailbox
    } = config

    // Check for some urls to never handle
    if (WindowOpeningEngine.shouldAlwaysIgnoreWindowOpen(targetUrl)) { return }

    // Check if the kill-switch is set for this
    if (settingsStore.getState().app.enableWindowOpeningEngine === false) {
      this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
      return
    }

    // Grab some info about our opener
    const webContentsId = evt.sender.id
    const currentUrl = evt.sender.getURL()

    // Setup our state
    let openMode = WINDOW_OPEN_MODES.EXTERNAL
    let partitionOverride

    // Run through our standard config
    try {
      const mode = WindowOpeningEngine.getRuleForWindowOpen(currentUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition)
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
          const matchTask = new WindowOpeningMatchTask(currentUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition)
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

    // Action the window open
    if (openMode === WINDOW_OPEN_MODES.POPUP_CONTENT) {
      const openedWindow = this.openWindowWaveboxPopupContent(openingBrowserWindow, tabMetaInfo, targetUrl, options)
      evt.newGuest = openedWindow.window
    } else if (openMode === WINDOW_OPEN_MODES.EXTERNAL) {
      this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
    } else if (openMode === WINDOW_OPEN_MODES.DEFAULT || openMode === WINDOW_OPEN_MODES.DEFAULT_IMPORTANT) {
      this.openWindowDefault(openingBrowserWindow, tabMetaInfo, mailbox, targetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.EXTERNAL_PROVSIONAL) {
      this.openWindowExternal(openingBrowserWindow, provisionalTargetUrl, mailbox)
    } else if (openMode === WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL || openMode === WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL_IMPORTANT) {
      this.openWindowDefault(openingBrowserWindow, tabMetaInfo, mailbox, provisionalTargetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.CONTENT) {
      this.openWindowWaveboxContent(openingBrowserWindow, tabMetaInfo, targetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.CONTENT_PROVSIONAL) {
      this.openWindowWaveboxContent(openingBrowserWindow, tabMetaInfo, provisionalTargetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.DOWNLOAD) {
      evt.sender.downloadURL(targetUrl)
    } else if (openMode === WINDOW_OPEN_MODES.CURRENT) {
      evt.sender.loadURL(targetUrl)
    } else if (openMode === WINDOW_OPEN_MODES.CURRENT_PROVISIONAL) {
      evt.sender.loadURL(provisionalTargetUrl)
    } else if (openMode === WINDOW_OPEN_MODES.BLANK_AND_CURRENT) {
      evt.sender.loadURL('about:blank')
      evt.sender.loadURL(targetUrl)
    } else if (openMode === WINDOW_OPEN_MODES.BLANK_AND_CURRENT_PROVISIONAL) {
      evt.sender.loadURL('about:blank')
      evt.sender.loadURL(provisionalTargetUrl)
    } else {
      this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
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
  *     @param mailbox=undefined: the mailbox if any
  *     @param windowTag: the tag of the window
  */
  handleWillNavigate (evt, config) {
    const {
      targetUrl,
      openingBrowserWindow,
      openingWindowType,
      mailbox
    } = config

    // Grab some info about our opener
    const webContentsId = evt.sender.id
    const currentUrl = evt.sender.getURL()

    let navigateMode
    try {
      navigateMode = WindowOpeningEngine.getRuleForNavigation(currentUrl, targetUrl, openingWindowType)
    } catch (ex) {
      console.error(`Failed to process default navigate rules. Continuing with "${navigateMode}" behaviour...`, ex)
    }

    if (navigateMode === WindowOpeningEngine.NAVIGATE_MODES.SUPPRESS) {
      evt.preventDefault()
    } else if (navigateMode === WindowOpeningEngine.NAVIGATE_MODES.OPEN_EXTERNAL) {
      evt.preventDefault()
      this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
    } else if (navigateMode === WindowOpeningEngine.NAVIGATE_MODES.OPEN_CONTENT) {
      evt.preventDefault()
      const webPreferences = evt.sender.getWebPreferences() || {}
      this.openWindowWaveboxContent(openingBrowserWindow, webContentsId, targetUrl, {
        webPreferences: {
          partition: webPreferences.partition
        }
      })
    } else if (navigateMode === WindowOpeningEngine.NAVIGATE_MODES.OPEN_CONTENT_RESET) {
      evt.preventDefault()
      const webPreferences = evt.sender.getWebPreferences() || {}
      this.openWindowWaveboxContent(openingBrowserWindow, webContentsId, targetUrl, {
        webPreferences: {
          partition: webPreferences.partition
        }
      })
      evt.sender.goToIndex(0)
    }
  }

  /* ****************************************************************************/
  // Window opening tools
  /* ****************************************************************************/

  /**
  * Opens a window with the default behaviour
  * @param openingBrowserWindow: the browser window that's opening
  * @param tabMetaInfo: the meta info to provide the new tab with
  * @param mailbox: the mailbox that's attempting to open
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @param partitionOverride = undefined: an optional override for the opener partition
  * @return the opened window if any
  */
  openWindowDefault (openingBrowserWindow, tabMetaInfo, mailbox, targetUrl, options, partitionOverride = undefined) {
    if (!mailbox) {
      return this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
    } else {
      if (mailbox.defaultWindowOpenMode === CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER) {
        return this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
      } else if (mailbox.defaultWindowOpenMode === CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX) {
        return this.openWindowWaveboxContent(openingBrowserWindow, tabMetaInfo, targetUrl, options, partitionOverride)
      }
    }
  }

  /**
  * Opens a wavebox popup content window
  * @param openingBrowserWindow: the browser window that's opening
  * @param tabMetaInfo: the meta info to provide the new tab with
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @return the new contentwindow instance
  */
  openWindowWaveboxPopupContent (openingBrowserWindow, tabMetaInfo, targetUrl, options) {
    const contentWindow = new ContentPopupWindow(tabMetaInfo)
    contentWindow.create(targetUrl, options)
    return contentWindow
  }

  /**
  * Opens a wavebox content window
  * @param openingBrowserWindow: the browser window that's opening
  * @param tabMetaInfo: the meta info to provide the new tab with
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @param partitionOverride = undefined: an optional override for the opener partition
  * @return the new contentwindow instance
  */
  openWindowWaveboxContent (openingBrowserWindow, tabMetaInfo, targetUrl, options, partitionOverride = undefined) {
    const contentWindow = new ContentWindow(tabMetaInfo)
    const openerPartition = ((options || {}).webPreferences || {}).partition
    const partitionId = partitionOverride || openerPartition
    contentWindow.create(openingBrowserWindow, targetUrl, partitionId, options)
    return contentWindow
  }

  /**
  * Opens links in an external window
  * @param openingBrowserWindow: the browser window that's opening
  * @param targetUrl: the url to open
  * @param mailbox=undefined: the mailbox to take the settings from if available
  */
  openWindowExternal (openingBrowserWindow, targetUrl, mailbox = undefined) {
    shell.openExternal(targetUrl, {
      activate: !settingsStore.getState().os.openLinksInBackground
    })
  }
}

export default new WindowOpeningHandler()
