import React from 'react'
import WaveboxRouter from './WaveboxRouter'
import constants from 'shared/constants'
import shallowCompare from 'react-addons-shallow-compare'
import Theme from 'sharedui/Components/Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { mailboxStore, mailboxDispatch, mailboxActions } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import { googleActions } from 'stores/google'
import { trelloActions } from 'stores/trello'
import { slackActions } from 'stores/slack'
import { microsoftActions } from 'stores/microsoft'
import { updaterActions } from 'stores/updater'
import { Analytics, ServerVent } from 'Server'
import { NotificationService, NotificationRenderer } from 'Notifications'
import Bootstrap from 'R/Bootstrap'
import AccountMessageDispatcher from './AccountMessageDispatcher'
import { Tray } from 'Components/Tray'
import { AppBadge, WindowTitle } from 'Components'
import {
  WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE,
  WB_MAILBOXES_WINDOW_SHOW_SETTINGS,
  WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER,
  WB_MAILBOXES_WINDOW_SHOW_NEWS,
  WB_MAILBOXES_WINDOW_ADD_ACCOUNT
} from 'shared/ipcEvents'
import { ipcRenderer, remote } from 'electron'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    // STEP 0. Maintaining focus
    this.refocusTO = null
    this.forceFocusTO = null
    remote.getCurrentWindow().on('focus', this.handleWindowFocused)

    // STEP 1. App services
    Analytics.startAutoreporting()
    ServerVent.start(Bootstrap.clientId, Bootstrap.clientToken)
    NotificationService.start()
    updaterActions.load()
    ipcRenderer.on(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.ipcLaunchSettings)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.ipcLaunchSupportCenter)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.ipcLaunchNews)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.ipcAddAccount)

    // STEP 2. Mailbox connections
    mailboxActions.connectAllMailboxes()
    googleActions.startPollingUpdates()
    trelloActions.startPollingUpdates()
    microsoftActions.startPollingUpdates()

    // STEP 3. Listen for self
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)
    mailboxDispatch.on('blurred', this.mailboxBlurred)
  }

  componentWillUnmount () {
    clearTimeout(this.refocusTO)
    clearInterval(this.forceFocusTO)
    remote.getCurrentWindow().removeListener('focus', this.handleWindowFocused)

    // STEP 1. App services
    Analytics.stopAutoreporting()
    ServerVent.stop()
    NotificationService.stop()
    updaterActions.unload()
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.ipcLaunchSettings)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.ipcLaunchSupportCenter)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.ipcLaunchNews)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.ipcAddAccount)

    // STEP 2. Mailbox connections
    mailboxActions.disconnectAllMailboxes()
    googleActions.stopPollingUpdates()
    trelloActions.stopPollingUpdates()
    slackActions.disconnectAllMailboxes()
    microsoftActions.stopPollingUpdates()

    // STEP 3. Listening for self
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)
    mailboxDispatch.removeListener('blurred', this.mailboxBlurred)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const mailboxState = mailboxStore.getState()
    return {
      messagesUnreadCount: mailboxState.totalUnreadCountForAppBadge(),
      hasUnreadActivity: mailboxState.hasUnreadActivityForAppBadge(),
      uiSettings: settingsState.ui,
      traySettings: settingsState.tray,
      launchTraySettings: settingsState.launched.tray,
      osSettings: settingsState.os
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState({
      messagesUnreadCount: mailboxState.totalUnreadCountForAppBadge(),
      hasUnreadActivity: mailboxState.hasUnreadActivityForAppBadge()
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      uiSettings: settingsState.ui,
      traySettings: settingsState.tray,
      osSettings: settingsState.os
    })
  }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Shows a notification of a completed download
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  downloadCompleted = (evt, req) => {
    const { downloadNotificationEnabled, downloadNotificationSoundEnabled } = this.state.osSettings
    if (!downloadNotificationEnabled) { return }

    NotificationRenderer.presentNotification('Download Complete', {
      body: req.filename,
      silent: !downloadNotificationSoundEnabled
    }, (req) => {
      remote.shell.openItem(req.path) || remote.shell.showItemInFolder(req.path)
    }, req)
  }

  /**
  * Launches the settings over the IPC channel
  */
  ipcLaunchSettings = () => {
    window.location.hash = '/settings'
  }

  /**
  * Launches the support center over the ipc channcel
  */
  ipcLaunchSupportCenter = () => {
    window.location.hash = '/settings/support'
  }

  /**
  * Launches the news dialog over the ipc channel
  */
  ipcLaunchNews = () => {
    window.location.hash = '/news'
  }

  /**
  * Launches the add account modal over the IPC channel
  */
  ipcAddAccount = () => {
    window.location.hash = '/mailbox_wizard/add'
  }

  /* **************************************************************************/
  // Rendering Events
  /* **************************************************************************/

  /**
  * Handles a mailbox bluring by trying to refocus the mailbox
  * @param evt: the event that fired
  */
  mailboxBlurred = (evt) => {
    // Requeue the event to run on the end of the render cycle
    clearTimeout(this.refocusTO)
    this.refocusTO = setTimeout(() => {
      const active = document.activeElement
      if (active.tagName === 'WEBVIEW') {
        // Nothing to do, already focused on mailbox
        clearInterval(this.forceFocusTO)
      } else if (active.tagName === 'BODY') {
        // Focused on body, just dip focus onto the webview
        clearInterval(this.forceFocusTO)
        mailboxDispatch.refocus()
      } else {
        // focused on some element in the ui, poll until we move back to body
        this.forceFocusTO = setInterval(() => {
          if (document.activeElement.tagName === 'BODY') {
            clearInterval(this.forceFocusTO)
            mailboxDispatch.refocus()
          }
        }, constants.REFOCUS_MAILBOX_INTERVAL_MS)
      }
    }, constants.REFOCUS_MAILBOX_INTERVAL_MS)
  }

  /**
  * Handles the window refocusing by pointing the focus back onto the active mailbox
  */
  handleWindowFocused = () => {
    mailboxDispatch.refocus()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      traySettings,
      launchTraySettings,
      uiSettings,
      messagesUnreadCount,
      hasUnreadActivity
    } = this.state

    return (
      <div>
        <MuiThemeProvider muiTheme={Theme}>
          <WaveboxRouter />
        </MuiThemeProvider>
        <AccountMessageDispatcher />
        <WindowTitle />
        {!traySettings.show ? undefined : (
          <Tray
            unreadCount={messagesUnreadCount}
            launchTraySettings={launchTraySettings}
            traySettings={traySettings} />
        )}
        {!uiSettings.showAppBadge ? undefined : (
          <AppBadge
            unreadCount={messagesUnreadCount}
            hasUnreadActivity={hasUnreadActivity} />
        )}
      </div>
    )
  }
}
