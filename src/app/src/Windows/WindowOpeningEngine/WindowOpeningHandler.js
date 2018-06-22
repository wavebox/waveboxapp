import { shell } from 'electron'
import ContentWindow from 'Windows/ContentWindow'
import ContentPopupWindow from 'Windows/ContentPopupWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { settingsStore } from 'stores/settings'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import WindowOpeningEngine from './WindowOpeningEngine'
import WindowOpeningRules from './WindowOpeningRules'
import WindowOpeningMatchTask from './WindowOpeningMatchTask'
import WINDOW_BACKING_TYPES from '../WindowBackingTypes'
import accountStore from 'stores/account/accountStore'
import uuid from 'uuid'

const WINDOW_OPEN_MODES = WindowOpeningEngine.WINDOW_OPEN_MODES
const NAVIGATE_MODES = WindowOpeningEngine.NAVIGATE_MODES

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
    const webContentsId = evt.sender.id
    const currentUrl = evt.sender.getURL()
    const currentHostUrl = this._getCurrentHostUrl(evt.sender.getURL(), tabMetaInfo)
    const mailbox = this._getMailboxFromTabMetaInfo(tabMetaInfo)

    // Check for some urls to never handle
    if (WindowOpeningEngine.shouldAlwaysIgnoreWindowOpen(targetUrl)) { return }

    // Check if the kill-switch is set for this
    if (settingsStore.getState().app.enableWindowOpeningEngine === false) {
      this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
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

    // Update the tab meta data
    const saltedTabMetaInfo = this._autosaltTabMetaInfo(tabMetaInfo, currentUrl, webContentsId)

    // Action the window open
    if (openMode === WINDOW_OPEN_MODES.POPUP_CONTENT) {
      const openedWindow = this.openWindowWaveboxPopupContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, options)
      evt.newGuest = openedWindow.window
    } else if (openMode === WINDOW_OPEN_MODES.EXTERNAL) {
      this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
    } else if (openMode === WINDOW_OPEN_MODES.DEFAULT || openMode === WINDOW_OPEN_MODES.DEFAULT_IMPORTANT) {
      this.openWindowDefault(openingBrowserWindow, saltedTabMetaInfo, mailbox, targetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.EXTERNAL_PROVSIONAL) {
      this.openWindowExternal(openingBrowserWindow, provisionalTargetUrl, mailbox)
    } else if (openMode === WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL || openMode === WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL_IMPORTANT) {
      this.openWindowDefault(openingBrowserWindow, saltedTabMetaInfo, mailbox, provisionalTargetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.CONTENT) {
      this.openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.CONTENT_PROVSIONAL) {
      this.openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, provisionalTargetUrl, options, partitionOverride)
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
    } else if (openMode === WINDOW_OPEN_MODES.SUPPRESS) {
      /* no-op */
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
  */
  handleWillNavigate (evt, config) {
    // Grab some info about our opener
    const {
      targetUrl,
      openingBrowserWindow,
      openingWindowType,
      tabMetaInfo
    } = config
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
        this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
      } else if (navigateMode === NAVIGATE_MODES.OPEN_CONTENT) {
        evt.preventDefault()
        this.openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
      } else if (navigateMode === NAVIGATE_MODES.OPEN_CONTENT_RESET) {
        evt.preventDefault()
        this.openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
        evt.sender.goToIndex(0)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_CONTENT) {
        evt.preventDefault()
        this.openWindowWaveboxContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
        this.closeOpeningWindowIfSupported(evt.sender.id)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_CONTENT_POPUP) {
        evt.preventDefault()
        this.openWindowWaveboxPopupContent(openingBrowserWindow, saltedTabMetaInfo, targetUrl, newWindowOptions)
        this.closeOpeningWindowIfSupported(evt.sender.id)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_EXTERNAL) {
        evt.preventDefault()
        this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
        this.closeOpeningWindowIfSupported(evt.sender.id)
      } else if (navigateMode === NAVIGATE_MODES.CONVERT_TO_DEFAULT) {
        evt.preventDefault()
        this.openWindowDefault(openingBrowserWindow, saltedTabMetaInfo, mailbox, targetUrl, newWindowOptions)
        this.closeOpeningWindowIfSupported(evt.sender.id)
      }
    }
  }

  /* ****************************************************************************/
  // Data tools
  /* ****************************************************************************/

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
      if (mailbox.defaultWindowOpenMode === ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER) {
        return this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
      } else if (mailbox.defaultWindowOpenMode === ACMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX) {
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
    const windowOptions = { ...options, webPreferences: undefined }
    const guestWebPreferences = (options.webPreferences || {})
    if (partitionOverride) {
      // Be careful about overwriting the partition. If we're trying to share affinity on different
      // partitions we're going to break the webcontents
      if (guestWebPreferences.affinity && partitionOverride !== guestWebPreferences.partition) {
        guestWebPreferences.affinity = `transient_${uuid.v4()}`
      }
      guestWebPreferences.partition = partitionOverride
    }
    contentWindow.create(targetUrl, windowOptions, openingBrowserWindow, guestWebPreferences)
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

  /**
  * Closes an opening window if it's supported
  * @param webContentsId: the id of the opening webcontents
  */
  closeOpeningWindowIfSupported (webContentsId) {
    const waveboxWindow = WaveboxWindow.fromWebContentsId(webContentsId)
    if (waveboxWindow) {
      if (waveboxWindow.allowsGuestClosing) {
        waveboxWindow.close()
      }
    }
  }
}

export default new WindowOpeningHandler()
