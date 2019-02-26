import { ipcMain } from 'electron'
import {
  WBRPC_OPEN_RECENT_LINK,
  WBRPC_OPEN_READING_QUEUE_LINK,
  WBRPC_GET_UPDATER_CONFIG,
  WBRPC_SYNC_GET_GUEST_PRELOAD_CONFIG,
  WBRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG,
  WBRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG
} from 'shared/WBRPCEvents'
import LinkOpener from 'LinkOpener'
import AppUpdater from 'AppUpdater'
import DistributionConfig from 'Runtime/DistributionConfig'
import Platform from 'shared/Platform'
import { URL } from 'url'
import { ElectronWebContents } from 'ElectronTools'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import { CRExtensionManager } from 'Extensions/Chrome'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import os from 'os'

const privConnected = Symbol('privConnected')
const privNotificationService = Symbol('privNotificationService')

class WBRPCWavebox {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param notificationService: the notification service
  */
  constructor (notificationService) {
    this[privConnected] = new Set()
    this[privNotificationService] = notificationService

    // Preload
    ipcMain.on(WBRPC_SYNC_GET_GUEST_PRELOAD_CONFIG, this._handleSyncGetGuestPreloadInfo)
    ipcMain.on(WBRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG, this._handleSyncGetExtensionContentScriptPreloadInfo)
    ipcMain.on(WBRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG, this._handleSyncGetExtensionHostedPreloadInfo)

    // Links
    ipcMain.on(WBRPC_OPEN_RECENT_LINK, this._handleOpenRecentLink)
    ipcMain.on(WBRPC_OPEN_READING_QUEUE_LINK, this._handleOpenReadingQueueLink)

    // Updates
    ipcMain.on(WBRPC_GET_UPDATER_CONFIG, this._handleGetUpdaterConfig)
  }

  /**
  * Connects the webcontents
  * @param contents: the webcontents to connect
  */
  connect (contents) {
    this[privConnected].add(contents.id)
  }

  /**
  * Disconnects a webcontents
  * @param contentsId: the id of the webcontents that has been disconnected
  */
  disconnect (contentsId) {
    this[privConnected].delete(contentsId)
  }

  /* ****************************************************************************/
  // IPC: Preload
  /* ****************************************************************************/

  /**
  * Synchronously gets the guest preload info
  * @param evt: the event that fired
  * @param currentUrl: the current url sent by the page
  */
  _handleSyncGetGuestPreloadInfo = (evt, currentUrl) => {
    if (!this[privConnected].has(evt.sender.id)) {
      evt.returnValue = {}
      return
    }

    // See note in _handleSyncGetInitialHostUrl about initialHostUrl
    try {
      evt.returnValue = {
        launchSettings: settingsStore.getState().launchSettingsJS(),
        launchUserSettings: userStore.getState().launchSettingsJS(),
        extensions: CRExtensionManager.runtimeHandler.getAllContentScriptGuestConfigs(),
        initialHostUrl: !currentUrl || currentUrl === 'about:blank' ? ElectronWebContents.getHostUrl(evt.sender) : currentUrl,
        notificationPermission: this[privNotificationService].getDomainPermissionForWebContents(evt.sender, currentUrl),
        paths: {},
        platform: process.platform,
        arch: process.arch,
        osRelease: os.release()
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_SYNC_GET_GUEST_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = {}
    }
  }

  /**
  * Synchronously gets the extension runtime config for a contentscript
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleSyncGetExtensionContentScriptPreloadInfo = (evt, extensionId) => {
    if (!this[privConnected].has(evt.sender.id)) {
      evt.returnValue = null
      return
    }

    try {
      const hasRuntime = CRExtensionManager.runtimeHandler.hasRuntime(extensionId)
      if (hasRuntime) {
        evt.returnValue = {
          extensionId: extensionId,
          hasRuntime: true,
          runtimeConfig: CRExtensionManager.runtimeHandler.getContentScriptRuntimeConfig(extensionId),
          isBackgroundPage: evt.sender.id === CRExtensionManager.runtimeHandler.getBackgroundPageId(extensionId)
        }
      } else {
        evt.returnValue = {
          extensionId: extensionId,
          hasRuntime: false
        }
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_SYNC_GET_EXTENSION_CS_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = null
    }
  }

  /**
  * Synchronously gets the extension runtime config for a hosted extension
  * @param evt: the event that fired
  * @param extensionId: the id of the extension
  */
  _handleSyncGetExtensionHostedPreloadInfo = (evt, extensionId) => {
    if (!this[privConnected].has(evt.sender.id)) {
      evt.returnValue = null
      return
    }

    // See note in _handleSyncGetInitialHostUrl about the url
    try {
      const wcUrl = evt.sender.getURL()
      const parsedUrl = new URL(!wcUrl || wcUrl === 'about:blank'
        ? ElectronWebContents.getHostUrl(evt.sender)
        : wcUrl
      )
      if (parsedUrl.protocol !== `${CR_EXTENSION_PROTOCOL}:` || parsedUrl.hostname !== extensionId) {
        // Something's not quite right in this case
        evt.returnValue = {
          extensionId: extensionId,
          hasRuntime: false
        }
      } else {
        const hasRuntime = CRExtensionManager.runtimeHandler.hasRuntime(extensionId)
        if (hasRuntime) {
          evt.returnValue = {
            extensionId: extensionId,
            hasRuntime: true,
            runtimeConfig: CRExtensionManager.runtimeHandler.getContentScriptRuntimeConfig(extensionId),
            isBackgroundPage: evt.sender.id === CRExtensionManager.runtimeHandler.getBackgroundPageId(extensionId)
          }
        } else {
          evt.returnValue = {
            extensionId: extensionId,
            hasRuntime: false
          }
        }
      }
    } catch (ex) {
      console.error(`Failed to respond to "${WBRPC_SYNC_GET_EXTENSION_HT_PRELOAD_CONFIG}" continuing with unknown side effects`, ex)
      evt.returnValue = null
    }
  }

  /* ****************************************************************************/
  // IPC: Links
  /* ****************************************************************************/

  /**
  * Handles the opening of a recent link
  * @param evt: the event that fired
  * @param serviceId: the id of the service
  * @param recentItem: the item we're trying to open
  */
  _handleOpenRecentLink = (evt, serviceId, recentItem) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    LinkOpener.openRecentLink(evt.sender, serviceId, recentItem)
  }

  /**
  * Handles the opening of a reading queue item
  * @param evt: the event that fired
  * @param serviceId: the id of the service to open in
  * @param readingItem: the reading item to open
  */
  _handleOpenReadingQueueLink = (evt, serviceId, readingItem) => {
    if (!this[privConnected].has(evt.sender.id)) { return }
    LinkOpener.openReadingQueueLink(evt.sender, serviceId, readingItem)
  }

  /* ****************************************************************************/
  // IPC: Updates
  /* ****************************************************************************/

  /**
  * Gets the updater config
  * @param evt: the event that fired
  * @param returnChannel: the channel to return the response to
  */
  _handleGetUpdaterConfig = (evt, returnChannel) => {
    Promise.resolve()
      .then(() => DistributionConfig.getDefaultOSPackageManager())
      .then((packageManager) => {
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, {
          osPackageManager: packageManager,
          autoupdaterSupportedPlatform: AppUpdater.isSupportedPlatform
        })
      })
      .catch((ex) => {
        console.error(`Failed to respond to "${WBRPC_GET_UPDATER_CONFIG}" continuing with unknown side effects`, ex)
        if (evt.sender.isDestroyed()) { return }
        evt.sender.send(returnChannel, {
          osPackageManager: Platform.PACKAGE_MANAGERS.UNKNOWN,
          autoupdaterSupportedPlatform: false
        })
      })
  }
}

export default WBRPCWavebox
