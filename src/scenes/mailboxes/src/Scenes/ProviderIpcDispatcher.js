import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { NotificationRenderer } from 'Notifications'
import {
  WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE,
  WB_MAILBOXES_WINDOW_SHOW_SETTINGS,
  WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT,
  WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER,
  WB_MAILBOXES_WINDOW_SHOW_NEWS,
  WB_MAILBOXES_WINDOW_ADD_ACCOUNT,
  WB_MAILBOXES_QUICK_SWITCH,
  WB_MAILBOXES_QUICK_SWITCH_PRESENT,
  WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE
} from 'shared/ipcEvents'
import { ipcRenderer, remote } from 'electron'

export default class ProviderIpcDispatcher extends React.Component {
  componentDidMount () {
    ipcRenderer.on(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.launchSettings)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT, this.launchWaveboxAccount)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.launchSupportCenter)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.launchNews)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.addAccount)
    ipcRenderer.on(WB_MAILBOXES_QUICK_SWITCH, this.quickSwitch)
    ipcRenderer.on(WB_MAILBOXES_QUICK_SWITCH_PRESENT, this.quickSwitchPresent)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE, this.openCommandPalette)

    setTimeout(() => {
      window.location.hash = "/switcher"
    },500)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.launchSettings)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT, this.launchWaveboxAccount)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.launchSupportCenter)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.launchNews)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.addAccount)
    ipcRenderer.removeListener(WB_MAILBOXES_QUICK_SWITCH, this.quickSwitch)
    ipcRenderer.removeListener(WB_MAILBOXES_QUICK_SWITCH_PRESENT, this.quickSwitchPresent)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE, this.openCommandPalette)
  }

  /* **************************************************************************/
  // Download Events
  /* **************************************************************************/

  /**
  * Shows a notification of a completed download
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  downloadCompleted = (evt, req) => {
    const {
      downloadNotificationEnabled,
      downloadNotificationSoundEnabled
    } = settingsStore.getState().os
    if (!downloadNotificationEnabled) { return }

    NotificationRenderer.presentNotification('Download Complete', {
      body: req.filename,
      silent: !downloadNotificationSoundEnabled
    }, (req) => {
      remote.shell.openItem(req.path) || remote.shell.showItemInFolder(req.path)
    }, req)
  }

  /* **************************************************************************/
  // Nav Events
  /* **************************************************************************/

  /**
  * Launches the settings over the IPC channel
  */
  launchSettings = () => {
    window.location.hash = '/settings'
  }

  /**
  * Launches the wavebox account over the IPC channel
  */
  launchWaveboxAccount = () => {
    window.location.hash = '/settings/pro'
  }

  /**
  * Launches the support center over the ipc channcel
  */
  launchSupportCenter = () => {
    window.location.hash = '/settings/support'
  }

  /**
  * Launches the news dialog over the ipc channel
  */
  launchNews = () => {
    window.location.hash = '/news'
  }

  /**
  * Opens the command palette
  */
  openCommandPalette = () => {
    window.location.hash = '/command'
  }

  /**
  * Launches the add account modal over the IPC channel
  */
  addAccount = () => {
    window.location.hash = '/mailbox_wizard/add'
  }

  /* **************************************************************************/
  // Quick Switch Events
  /* **************************************************************************/

  /**
  * Quick switches to the next account
  */
  quickSwitch = (evt) => {
    window.location.hash = '/'
    accountActions.quickSwitchService()
  }

  /**
  * Launches quick switch
  */
  quickSwitchPresent = (evt) => {
    window.location.hash = '/switcher'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return false
  }
}
