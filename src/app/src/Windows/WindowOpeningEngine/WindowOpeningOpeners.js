import { shell, BrowserWindow, ipcMain } from 'electron'
import ContentWindow from 'Windows/ContentWindow'
import ContentPopupWindow from 'Windows/ContentPopupWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import uuid from 'uuid'
import CRExtensionWebPreferences from 'WebContentsManager/CRExtensionWebPreferences'
import LinkOpener from 'LinkOpener'
import {
  WB_ULINKOR_ASK,
  WB_ULINKOR_OPEN,
  WB_ULINKOR_CANCEL
} from 'shared/ipcEvents'

const privPendingULinkOR = Symbol('privPendingULinkOR')

const MAX_ASK_USER_TIME = 1000 * 60 * 10 // 10 mins

class WindowOpeningOpeners {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this[privPendingULinkOR] = new Map()

    ipcMain.on(WB_ULINKOR_OPEN, this._handleULinkOROpen)
    ipcMain.on(WB_ULINKOR_CANCEL, this._handleULinkORCancel)
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
      return this.askUserForWindowOpenTarget(openingBrowserWindow, tabMetaInfo, mailbox, targetUrl, options, partitionOverride)
    } else {
      let match
      try {
        const accountState = accountStore.getState()
        const allMailboxIds = accountState.mailboxIds()
        const allServiceIds = accountState.serviceIds()
        const customProviderIds = settingsStore.getState().os.customLinkProviderIds
        match = mailbox.resolveWindowOpenRule(targetUrl, allMailboxIds, allServiceIds, customProviderIds)

        // Run a late cleanup on this in case services have been removed
        accountActions.cleanMailboxWindowOpenRules.defer(mailbox.id, customProviderIds)
      } catch (ex) {
        match = { mode: ACMailbox.USER_WINDOW_OPEN_MODES.ASK }
        console.error(`Failed to process user window rules. Continuing with "${ACMailbox.USER_WINDOW_OPEN_MODES.ASK}" behaviour...`, ex)
      }

      if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.BROWSER) {
        return this.openWindowExternal(openingBrowserWindow, targetUrl)
      } else if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX) {
        return this.openWindowWaveboxContent(openingBrowserWindow, tabMetaInfo, targetUrl, options, partitionOverride)
      } else if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW) {
        return LinkOpener.openUrlInServiceWindow(match.serviceId, targetUrl)
      } else if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB) {
        return LinkOpener.openUrlInTopLevelService(match.serviceId, targetUrl)
      } else if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER) {
        return LinkOpener.openUrlInCustomLinkProvider(match.providerId, targetUrl)
      } else if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.ASK) {
        return this.askUserForWindowOpenTarget(openingBrowserWindow, tabMetaInfo, mailbox, targetUrl, options, partitionOverride)
      } else if (match.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW) {
        return LinkOpener.openUrlInMailboxWindow(match.mailboxId, targetUrl)
      } else {
        // Totally undefined state - do something sensible
        return this.askUserForWindowOpenTarget(openingBrowserWindow, tabMetaInfo, mailbox, targetUrl, options, partitionOverride)
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
      // partitions we're going to break the webcontents. We also see some odd behaviour when the
      // overwriting partition is chrome extension one. Hive this off into its own process
      // to prevent this. (Grammarly signin from BA doesn't fire correctly)
      if (guestWebPreferences.affinity && (partitionOverride !== guestWebPreferences.partition || CRExtensionWebPreferences.isExtensionPartition(partitionOverride))) {
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
  */
  openWindowExternal (openingBrowserWindow, targetUrl) {
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

  /* ****************************************************************************/
  // User Link Open Request
  /* ****************************************************************************/

  /**
  * Asks the user where the window should be opened
  * @param openingBrowserWindow: the browser window that's opening
  * @param tabMetaInfo: the meta info to provide the new tab with
  * @param mailbox: the mailbox that's attempting to open
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @param partitionOverride = undefined: an optional override for the opener partition
  * @param isCommandTrigger = false: set to true if this was triggered by a modifier
  * @return the opened window if any
  */
  askUserForWindowOpenTarget (openingBrowserWindow, tabMetaInfo, mailbox, targetUrl, options, partitionOverride = undefined, isCommandTrigger = false) {
    const waveboxWindow = WaveboxWindow.fromBrowserWindow(openingBrowserWindow)
    const responder = waveboxWindow
      ? waveboxWindow.userLinkOpenRequestResponder()
      : undefined

    if (responder) {
      const requestId = this._createULinkOR(openingBrowserWindow.id, tabMetaInfo, targetUrl, options, partitionOverride)
      responder.send(
        WB_ULINKOR_ASK,
        requestId,
        (tabMetaInfo.opener || {}).webContentsId,
        tabMetaInfo.serviceId,
        targetUrl,
        isCommandTrigger,
        MAX_ASK_USER_TIME
      )
      return
    }

    return this.openWindowExternal(openingBrowserWindow, targetUrl)
  }

  /**
  * Creates a new window open request that asks the users preference
  * @param openingBrowserWindowId: the id of the browser window that's opening
  * @param tabMetaInfo: the meta info to provide the new tab with
  * @param targetUrl: the url to open
  * @param options: the config options for the window
  * @param partitionOverride: an optional override for the opener partition
  * @return the request id
  */
  _createULinkOR (openingBrowserWindowId, tabMetaInfo, targetUrl, options, partitionOverride) {
    // The create run of this function is intentionally split to help future devs be aware
    // of this...
    //
    // Be careful about memory leaks here. If you retain the window, you're potentially
    // going to be in a retain loop, so don't do that.
    //
    // You are going to be retaining the webContents (via options) which probably will result in a memory
    // leak. This would happen if the user closes the window and the close call fails to
    // run because everyone is retained. It's not great, but to prevent a long term
    // leak, set a 10 minute timeout to teardown automatically. The user shouldn't
    // take 10 minutes to decide and it just ensures if the app is running for days
    // memory doesn't run away
    //
    // Wherever possible pass only primitives into this function and re-grab the data
    // when required
    const requestId = uuid.v4()

    /* ******************* */
    // Teardown
    /* ******************* */
    const teardownFn = () => {
      const rec = this[privPendingULinkOR].get(requestId)
      if (!rec) { return }

      clearTimeout(rec.timeout)
      const boundWindow = BrowserWindow.fromId(openingBrowserWindowId)
      if (boundWindow && !boundWindow.isDestroyed()) {
        boundWindow.removeListener('closed', rec.teardownFn)
      }
      this[privPendingULinkOR].delete(requestId)
    }

    /* ******************* */
    // Default browser
    /* ******************* */
    const defaultBrowserFn = () => {
      this.openWindowExternal(BrowserWindow.fromId(openingBrowserWindowId), targetUrl)
      teardownFn()
    }

    /* ******************* */
    // Wavebox Window
    /* ******************* */
    const waveboxWindowFn = () => {
      this.openWindowWaveboxContent(
        BrowserWindow.fromId(openingBrowserWindowId),
        tabMetaInfo,
        targetUrl,
        options,
        partitionOverride
      )
      teardownFn()
    }

    /* ******************* */
    // Running tab
    /* ******************* */
    const runningServiceTabFn = (serviceId) => {
      LinkOpener.openUrlInTopLevelService(serviceId, targetUrl)
      teardownFn()
    }

    /* ******************* */
    // Service window
    /* ******************* */
    const serviceWindowFn = (serviceId) => {
      LinkOpener.openUrlInServiceWindow(serviceId, targetUrl)
      teardownFn()
    }
    const mailboxWindowFn = (mailboxId) => {
      LinkOpener.openUrlInMailboxWindow(mailboxId, targetUrl)
      teardownFn()
    }

    /* ******************* */
    // Custom link target
    /* ******************* */
    const customLinkTargetFn = (linkProviderId) => {
      LinkOpener.openUrlInCustomLinkProvider(linkProviderId, targetUrl)
      teardownFn()
    }

    // Bind to window close events
    const boundWindow = BrowserWindow.fromId(openingBrowserWindowId)
    if (boundWindow && !boundWindow.isDestroyed()) {
      boundWindow.on('closed', teardownFn)
    }

    // Save the request info
    this[privPendingULinkOR].set(requestId, {
      timeout: setTimeout(teardownFn, MAX_ASK_USER_TIME),
      teardownFn: teardownFn,
      defaultBrowserFn: defaultBrowserFn,
      waveboxWindowFn: waveboxWindowFn,
      runningServiceTabFn: runningServiceTabFn,
      serviceWindowFn: serviceWindowFn,
      mailboxWindowFn: mailboxWindowFn,
      customLinkTargetFn: customLinkTargetFn
    })

    return requestId
  }

  /* ****************************************************************************/
  // User Link Open Request: Ipc handlers
  /* ****************************************************************************/

  /**
  * Handles a ULinkOR request coming back to open
  * @param evt: the event that fired
  * @param requestId: the id of the request
  * @param openMode: the open mode to use
  * @param target: the optional target to use
  */
  _handleULinkOROpen = (evt, requestId, openMode, target) => {
    const req = this[privPendingULinkOR].get(requestId)
    if (req) {
      switch (openMode) {
        case ACMailbox.USER_WINDOW_OPEN_MODES.BROWSER:
          req.defaultBrowserFn()
          break
        case ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX:
          req.waveboxWindowFn()
          break
        case ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW:
          req.serviceWindowFn(target)
          break
        case ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW:
          req.mailboxWindowFn(target)
          break
        case ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB:
          req.runningServiceTabFn(target)
          break
        case ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER:
          req.customLinkTargetFn(target)
          break
      }
    }
  }

  /**
  * Handles a UlinkOR request cancelling or requiring no further action
  * @param evt: the event that fired
  * @param requestId: the id of the request
  */
  _handleULinkORCancel = (evt, requestId) => {
    const req = this[privPendingULinkOR].get(requestId)
    if (req) { req.teardownFn() }
  }
}

export default WindowOpeningOpeners
