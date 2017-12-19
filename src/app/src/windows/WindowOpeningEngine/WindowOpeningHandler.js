import { shell, webContents } from 'electron'
import ContentWindow from 'windows/ContentWindow'
import ContentPopupWindow from 'windows/ContentPopupWindow'
import settingStore from 'stores/settingStore'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import WindowOpeningEngine from './WindowOpeningEngine'

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
  *     @param ownerId=undefined: the id of the owner
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
      ownerId,
      provisionalTargetUrl,
      mailbox
    } = config

    // Check for some urls to never handle
    if (WindowOpeningEngine.shouldAlwaysIgnoreWindowOpen(targetUrl)) { return }

    // Grab some info about our opener
    const webContentsId = evt.sender.id
    const currentUrl = evt.sender.getURL()

    // Setup our state
    let openMode = WINDOW_OPEN_MODES.EXTERNAL
    let partitionOverride

    // Run through our standard config
    openMode = WindowOpeningEngine.getRuleForWindowOpen(currentUrl, targetUrl, openingWindowType, provisionalTargetUrl, disposition)

    // Look to see if the mailbox has an override
    if (mailbox) {
      const mailboxOverride = mailbox.getWindowOpenModeOverrides(currentUrl, targetUrl, provisionalTargetUrl, disposition)
      if (mailboxOverride && WINDOW_OPEN_MODES[mailboxOverride.toUpperCase()]) {
        openMode = WINDOW_OPEN_MODES[mailboxOverride.toUpperCase()]
      }
    }

    // Check installed extensions to see if they overwrite the behaviour
    const extensionRule = WindowOpeningEngine.getExtensionRuleForWindowOpen(webContentsId, targetUrl, disposition)
    if (extensionRule.match) {
      openMode = extensionRule.mode
      partitionOverride = extensionRule.partitionOverride
    }

    // Action the window open
    let openedWindow
    if (openMode === WINDOW_OPEN_MODES.POPUP_CONTENT) {
      openedWindow = this.openWindowWaveboxPopupContent(openingBrowserWindow, ownerId, targetUrl, options)
      evt.newGuest = openedWindow.window
    } else if (openMode === WINDOW_OPEN_MODES.EXTERNAL) {
      openedWindow = this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
    } else if (openMode === WINDOW_OPEN_MODES.DEFAULT || openMode === WINDOW_OPEN_MODES.DEFAULT_IMPORTANT) {
      openedWindow = this.openWindowDefault(openingBrowserWindow, ownerId, mailbox, targetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.EXTERNAL_PROVSIONAL) {
      openedWindow = this.openWindowExternal(openingBrowserWindow, provisionalTargetUrl, mailbox)
    } else if (openMode === WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL || openMode === WINDOW_OPEN_MODES.DEFAULT_PROVISIONAL_IMPORTANT) {
      openedWindow = this.openWindowDefault(openingBrowserWindow, ownerId, mailbox, provisionalTargetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.CONTENT) {
      openedWindow = this.openWindowWaveboxContent(openingBrowserWindow, ownerId, targetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.CONTENT_PROVSIONAL) {
      openedWindow = this.openWindowWaveboxContent(openingBrowserWindow, ownerId, provisionalTargetUrl, options, partitionOverride)
    } else if (openMode === WINDOW_OPEN_MODES.DOWNLOAD) {
      evt.sender.downloadURL(targetUrl)
    }

    // Add any final bind events from the extension. Mainly as work-arounds for window opener
    if (extensionRule.match) {
      if (typeof (extensionRule.config.match.actions) === 'object') {
        if (extensionRule.config.match.actions.onClose === 'reload_opener') {
          if (openedWindow) {
            openedWindow.on('closed', () => {
              const openerWC = webContents.fromId(webContentsId)
              if (openerWC) {
                openerWC.reload()
              }
            })
          }
        }
      }
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
  *     @param ownerId=undefined: the id of the owner
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

    const navigateMode = WindowOpeningEngine.getRuleForNavigation(currentUrl, targetUrl, openingWindowType)

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
  * @param ownerId: the id of the owning window
  * @param mailbox: the mailbox that's attempting to open
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @param partitionOverride = undefined: an optional override for the opener partition
  * @return the opened window if any
  */
  openWindowDefault (openingBrowserWindow, ownerId, mailbox, targetUrl, options, partitionOverride = undefined) {
    if (!mailbox) {
      return this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
    } else {
      if (mailbox.defaultWindowOpenMode === CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER) {
        return this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
      } else if (mailbox.defaultWindowOpenMode === CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX) {
        return this.openWindowWaveboxContent(openingBrowserWindow, ownerId, targetUrl, options, partitionOverride)
      }
    }
  }

  /**
  * Opens a wavebox popup content window
  * @param openingBrowserWindow: the browser window that's opening
  * @param ownerId: the id of the owning window
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @return the new contentwindow instance
  */
  openWindowWaveboxPopupContent (openingBrowserWindow, ownerId, targetUrl, options) {
    const contentWindow = new ContentPopupWindow(ownerId)
    contentWindow.create(targetUrl, options)
    return contentWindow
  }

  /**
  * Opens a wavebox content window
  * @param openingBrowserWindow: the browser window that's opening
  * @param ownerId: the id of the owning window
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @param partitionOverride = undefined: an optional override for the opener partition
  * @return the new contentwindow instance
  */
  openWindowWaveboxContent (openingBrowserWindow, ownerId, targetUrl, options, partitionOverride = undefined) {
    const contentWindow = new ContentWindow(ownerId)
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
      activate: !settingStore.os.openLinksInBackground
    })
  }
}

export default new WindowOpeningHandler()
