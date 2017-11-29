import { ipcMain, shell, BrowserWindow, webContents } from 'electron'
import { evtMain } from 'AppEvents'
import ContentWindow from 'windows/ContentWindow'
import ContentPopupWindow from 'windows/ContentPopupWindow'
import url from 'url'
import settingStore from 'stores/settingStore'
import mailboxStore from 'stores/mailboxStore'
import CoreService from 'shared/Models/Accounts/CoreService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import CRExtensionManager from 'Extensions/Chrome/CRExtensionManager'
import CRExtensionManifest from 'shared/Models/CRExtension/CRExtensionManifest'
import {
  WB_NEW_WINDOW
} from 'shared/ipcEvents'
import {
  WAVEBOX_CAPTURE_URL_PREFIX,
  WAVEBOX_CAPTURE_URL_HOSTNAME
} from 'shared/constants'
import {
  WAVEBOX_HOSTED_EXTENSION_PROTOCOL,
  CR_EXTENSION_BG_PARTITION_PREFIX
} from 'shared/extensionApis'

const WINDOW_OPEN_MODES = CoreService.WINDOW_OPEN_MODES

class MailboxesWindowBehaviour {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param webContentsId: the host window webcontents
  * @param tabManager: the tab manager for the window
  */
  constructor (webContentsId, tabManager) {
    this.webContentsId = webContentsId
    this.tabManager = tabManager

    evtMain.on(evtMain.WB_TAB_CREATED, this.handleTabCreated)
    ipcMain.on(WB_NEW_WINDOW, this.handleOpenIPCWaveboxWindow)
  }

  destroy () {
    evtMain.removeListener(evtMain.WB_TAB_CREATED, this.handleTabCreated)
    ipcMain.removeListener(WB_NEW_WINDOW, this.handleOpenIPCWaveboxWindow)
  }

  /* ****************************************************************************/
  // Event handlers: App
  /* ****************************************************************************/

  /**
  * Handles a new tab being created
  * @param webContentsId: the id of the webcontents
  */
  handleTabCreated = (webContentsId) => {
    const contents = webContents.fromId(webContentsId)
    if (contents && contents.getType() === 'webview' && contents.hostWebContents.id === this.webContentsId) {
      contents.on('new-window', this.handleWebViewNewWindow)
      contents.on('will-navigate', this.handleWebViewWillNavigate)
      contents.on('before-input-event', this.handleBeforeInputEvent)
      contents.on('destroyed', () => {
        contents.removeListener('before-input-event', this.handleBeforeInputEvent) // Doesn't get un-bound automatically
      })
    }
  }

  /* ****************************************************************************/
  // Event handlers: IPC
  /* ****************************************************************************/

  /**
  * Opens a new content window
  * @param evt: the event that fired
  * @param body: the arguments from the body
  */
  handleOpenIPCWaveboxWindow = (evt, body) => {
    if (evt.sender.id === this.webContentsId) {
      const contentWindow = new ContentWindow(`${body.mailboxId}:${body.serviceType}`)

      const window = BrowserWindow.fromWebContents(evt.sender)
      contentWindow.create(window, body.url, body.partition, body.windowPreferences, body.webPreferences)
    }
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * Gets the opening browser window from an event
  * @param evt: the event that sent, should have evt.sender
  * @return the top-level browser window that fired
  */
  _getOpeningBrowserWindow (evt) {
    if (!evt.sender) { return undefined }
    if (evt.sender.hostWebContents) {
      return BrowserWindow.fromWebContents(evt.sender.hostWebContents)
    } else {
      return BrowserWindow.fromWebContents(evt.sender)
    }
  }

  /* ****************************************************************************/
  // WebView Events
  /* ****************************************************************************/

  /**
  * Handles a new window being generated from a webview
  * @param evt: the event that fired
  * @param targetUrl: the webview url
  * @param frameName: the name of the frame
  * @param disposition: the frame disposition
  * @param options: the browser window options
  * @param additionalFeatures: The non-standard features
  */
  handleWebViewNewWindow = (evt, targetUrl, frameName, disposition, options, additionalFeatures) => {
    evt.preventDefault()

    const openingBrowserWindow = this._getOpeningBrowserWindow(evt)
    const webContentsId = evt.sender.id

    // Check for some urls to never handle
    const purl = url.parse(targetUrl, true)
    if (purl.hostname === WAVEBOX_CAPTURE_URL_HOSTNAME && purl.pathname.startsWith(WAVEBOX_CAPTURE_URL_PREFIX)) { return }

    // Handle other urls
    let openMode = WINDOW_OPEN_MODES.EXTERNAL
    let ownerId = null
    let mailbox = null
    let service = null
    let provisionalTargetUrl
    let partitionOverride

    // Grab the service and mailbox
    if (this.tabManager.hasServiceId(webContentsId)) {
      const { mailboxId, serviceType } = this.tabManager.getServiceId(webContentsId)
      ownerId = `${mailboxId}:${serviceType}`
      mailbox = mailboxStore.getMailbox(mailboxId)
      service = mailboxStore.getService(mailboxId, serviceType)
    }

    if (service) {
      provisionalTargetUrl = this.tabManager.getTargetUrl(webContentsId)
      openMode = service.getWindowOpenModeForUrl(
        targetUrl,
        purl,
        disposition,
        provisionalTargetUrl,
        provisionalTargetUrl ? url.parse(provisionalTargetUrl, true) : undefined
      )
    }

    // Check installed extensions to see if they overwrite the behaviour
    const extensionPopoutConfig = CRExtensionManager.runtimeHandler.getWindowPopoutModePreference(webContentsId, targetUrl, purl, disposition)
    if (extensionPopoutConfig !== false) {
      if (extensionPopoutConfig.mode === CRExtensionManifest.POPOUT_WINDOW_MODES.POPOUT) {
        openMode = WINDOW_OPEN_MODES.POPUP_CONTENT
      } else if (extensionPopoutConfig.mode === CRExtensionManifest.POPOUT_WINDOW_MODES.CONTENT) {
        openMode = WINDOW_OPEN_MODES.CONTENT
      } else if (extensionPopoutConfig.mode === CRExtensionManifest.POPOUT_WINDOW_MODES.CONTENT_BACKGROUND) {
        openMode = WINDOW_OPEN_MODES.CONTENT
        if (extensionPopoutConfig.extension.manifest.hasBackground) {
          partitionOverride = `${CR_EXTENSION_BG_PARTITION_PREFIX}${extensionPopoutConfig.extension.id}`
        }
      }
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
      if ((options || {}).webContents) {
        options.webContents.downloadURL(targetUrl)
      }
    }

    // Add any final bind events from the extension. Mainly as work-arounds for window opener
    if (extensionPopoutConfig) {
      if (typeof (extensionPopoutConfig.match.actions) === 'object') {
        if (extensionPopoutConfig.match.actions.onClose === 'reload_opener') {
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

  /**
  * Handles the webview navigating
  * @param evt: the event that fired
  * @param targetUrl: the url we're navigating to
  */
  handleWebViewWillNavigate = (evt, targetUrl) => {
    const openingBrowserWindow = this._getOpeningBrowserWindow(evt)
    const webContentsId = evt.sender.id

    // Extensions
    if (this.tabManager.hasExtensionPane(webContentsId)) {
      if (url.parse(targetUrl).protocol !== WAVEBOX_HOSTED_EXTENSION_PROTOCOL + ':') {
        evt.preventDefault()
        return
      }
    }

    // Navigation modes
    if (this.tabManager.hasServiceId(webContentsId)) {
      const { mailboxId, mailbox, service } = this.tabManager.getService(webContentsId)

      let navigateMode = CoreService.NAVIGATE_MODES.DEFAULT
      if (service) {
        navigateMode = service.getNavigateModeForUrl(targetUrl, url.parse(targetUrl, true))
      }

      if (navigateMode === CoreService.NAVIGATE_MODES.SUPPRESS) {
        evt.preventDefault()
      } else if (navigateMode === CoreService.NAVIGATE_MODES.OPEN_EXTERNAL) {
        evt.preventDefault()
        this.openWindowExternal(openingBrowserWindow, targetUrl, mailbox)
      } else if (navigateMode === CoreService.NAVIGATE_MODES.OPEN_CONTENT) {
        evt.preventDefault()
        this.openWindowWaveboxContent(openingBrowserWindow, webContentsId, targetUrl, {
          webPreferences: {
            partition: `persist:${mailboxId}`
          }
        })
      }
    }
  }

  /**
  * Checks to see if any key combinations are banned from entering the webview.
  * These would be ones that interfere with accelerators
  * @param evt: the event that fired
  * @param input: the input details
  */
  handleBeforeInputEvent = (evt, input) => {
    // Do the fastest check we can first
    if (!input.shift && !input.control && !input.alt && !input.meta) { return }

    // Grab everything we need dropping out as we go...
    const webContentsId = evt.sender.id
    if (!this.tabManager.hasServiceId(webContentsId)) { return }
    const { mailboxId, serviceType } = this.tabManager.getServiceId(webContentsId)
    const service = mailboxStore.getService(mailboxId, serviceType)
    if (!service) { return }

    if (service.shouldPreventInputEvent(input)) {
      evt.preventDefault()
      evtMain.emit(evtMain.INPUT_EVENT_PREVENTED, evt.sender.id, input)
    }
  }

  /* ****************************************************************************/
  // Window opening
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

export default MailboxesWindowBehaviour
