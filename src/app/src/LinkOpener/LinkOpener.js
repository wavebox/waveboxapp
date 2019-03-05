import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import WINDOW_TYPES from 'Windows/WindowTypes'
import WINDOW_BACKING_TYPES from 'Windows/WindowBackingTypes'
import WaveboxWindow from 'Windows/WaveboxWindow'
import ContentWindow from 'Windows/ContentWindow'
import MailboxesWindow from 'Windows/MailboxesWindow'
import {
  WB_READING_QUEUE_OPEN_URL,
  WB_READING_QUEUE_OPEN_URL_EMPTY
} from 'shared/ipcEvents'
import { spawn } from 'child_process'

class LinkOpener {
  /* **************************************************************************/
  // Recents
  /* **************************************************************************/

  /**
  * Handles the opening of a recent link
  * @param contents: the webContents trying to action this
  * @param serviceId: the id of the service trying to open the link
  * @param recentItem: the recent item to open
  */
  openRecentLink (contents, serviceId, recentItem) {
    if (recentItem.windowType === WINDOW_TYPES.MAIN) {
      const mailboxesWindow = MailboxesWindow.getOfType(MailboxesWindow)
      if (!mailboxesWindow) { return }
      mailboxesWindow.show().focus()
      mailboxesWindow.navigateAndSwitchToService(serviceId, recentItem.url)
    } else {
      const accountState = accountStore.getState()
      const service = accountState.getService(serviceId)
      if (!service) { return }

      const contentWindow = new ContentWindow({
        backing: WINDOW_BACKING_TYPES.MAILBOX_SERVICE,
        mailboxId: service.parentId,
        serviceId: serviceId
      })
      contentWindow.create(
        recentItem.url,
        undefined,
        undefined,
        { partition: service.partitionId }
      )
    }
  }

  /* **************************************************************************/
  // Reading queue
  /* **************************************************************************/

  /**
  * Handles the opening of a reading queue item
  * @param contents: the webContents trying to action this
  * @param serviceId: the id of the service to open in
  * @param readingItem: the reading item to open
  */
  openReadingQueueLink (contents, serviceId, readingItem) {
    const openingWindow = contents ? WaveboxWindow.fromTabId(contents.id) : undefined
    const openingWindowType = openingWindow ? openingWindow.windowType : undefined

    if (openingWindowType === WINDOW_TYPES.MAIN) {
      openingWindow.show().focus()
      openingWindow.navigateAndSwitchToService(serviceId, readingItem.url)
      openingWindow.rootWebContents.send(WB_READING_QUEUE_OPEN_URL, readingItem)
    } else {
      const accountState = accountStore.getState()
      const service = accountState.getService(serviceId)
      if (!service) { return }

      const contentWindow = new ContentWindow({
        backing: WINDOW_BACKING_TYPES.MAILBOX_SERVICE,
        mailboxId: service.parentId,
        serviceId: serviceId
      })
      contentWindow.create(
        readingItem.url,
        undefined,
        undefined,
        { partition: service.partitionId }
      )
    }
    accountActions.removeFromReadingQueue(serviceId, readingItem.id)
  }

  /**
  * Opens the next reading queue item in the active account
  */
  openNextActiveReadingQueueLink () {
    const accountState = accountStore.getState()
    const service = accountState.activeService()
    if (!service) { return }

    const mailboxesWindow = MailboxesWindow.getOfType(MailboxesWindow)
    if (!mailboxesWindow) { return }

    mailboxesWindow.show().focus()
    if (!service.readingQueue.length) {
      mailboxesWindow.rootWebContents.send(WB_READING_QUEUE_OPEN_URL_EMPTY)
    } else {
      const readingItem = service.readingQueue[0]
      mailboxesWindow.navigateAndSwitchToService(service.id, readingItem.url)
      mailboxesWindow.rootWebContents.send(WB_READING_QUEUE_OPEN_URL, readingItem)
      accountActions.removeFromReadingQueue(service.id, readingItem.id)
    }
  }

  /* **************************************************************************/
  // Urls
  /* **************************************************************************/

  /**
  * Opens a url in the top level servic tab
  * @param serviceId: the id of the service
  * @param url: the url to open
  */
  openUrlInTopLevelService (serviceId, url) {
    const mailboxesWindow = MailboxesWindow.getOfType(MailboxesWindow)
    if (!mailboxesWindow) { return }
    mailboxesWindow.show().focus()
    mailboxesWindow.navigateAndSwitchToService(serviceId, url)
  }

  /**
  * Opens a url in a new window under the mailbox, but shimming the first service as the opener
  * @param serviceId: the id of the service to open under
  * @param url: the url to open
  * @param openerWindow=undefined: the parent electron.BrowserWindow if available/appplicable
  * @return the created content window
  */
  openUrlInMailboxWindow (mailboxId, url, openerWindow = undefined) {
    const mailbox = accountStore.getState().getMailbox(mailboxId)
    if (!mailbox) { return undefined }
    return this.openUrlInServiceWindow(mailbox.allServices[0], url, openerWindow)
  }

  /**
  * Opens a url in a new window under the service partition
  * @param serviceId: the id of the service to open under
  * @param url: the url to open
  * @param openerWindow=undefined: the parent electron.BrowserWindow if available/appplicable
  * @return the created content window
  */
  openUrlInServiceWindow (serviceId, url, openerWindow = undefined) {
    const service = accountStore.getState().getService(serviceId)
    if (!service) { return undefined }

    const contentWindow = new ContentWindow({
      backing: WINDOW_BACKING_TYPES.MAILBOX_SERVICE,
      mailboxId: service.parentId,
      serviceId: serviceId
    })
    contentWindow.create(
      url,
      undefined,
      openerWindow,
      { partition: service.partitionId }
    )
    return contentWindow
  }

  /**
  * Opens a url in a custom link provider
  * @param linkProviderId: the id of the link provider
  * @param targetUrl: the url to open
  */
  openUrlInCustomLinkProvider (linkProviderId, targetUrl) {
    const linkProvider = settingsStore.getState().os.getCustomLinkProvider(linkProviderId)
    if (!linkProvider) { return }

    const args = (linkProvider.args || [])
      .map((arg) => {
        if (typeof (arg) === 'string') {
          return arg
        } else if (typeof (arg) === 'object') {
          if (arg.type === 'url') {
            return targetUrl
          } else {
            return undefined
          }
        } else {
          return undefined
        }
      })
      .filter((arg) => !!arg)

    spawn(
      linkProvider.cmd,
      args,
      { detached: true, windowsHide: true }
    )
  }

  /* **************************************************************************/
  // Service Commands
  /* **************************************************************************/

  /**
  * Runs a service command
  * @param contents: the webContents trying to action this
  * @param serviceId: the id of the service to open in
  * @param commandSring: the full command string
  */
  runServiceCommand (contents, serviceId, commandString) {
    const mailboxesWindow = MailboxesWindow.getOfType(MailboxesWindow)
    if (!mailboxesWindow) { return }
    mailboxesWindow.show().focus()
    mailboxesWindow.runCommandAndSwitchToService(serviceId, commandString)
  }
}

export default new LinkOpener()
