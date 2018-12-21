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
  WB_QUICK_SWITCH_NEXT,
  WB_QUICK_SWITCH_PREV,
  WB_QUICK_SWITCH_PRESENT_NEXT,
  WB_QUICK_SWITCH_PRESENT_PREV,
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
    ipcRenderer.on(WB_QUICK_SWITCH_NEXT, this.quickSwitchNext)
    ipcRenderer.on(WB_QUICK_SWITCH_PREV, this.quickSwitchPrev)
    ipcRenderer.on(WB_QUICK_SWITCH_PRESENT_NEXT, this.quickSwitchPresentNext)
    ipcRenderer.on(WB_QUICK_SWITCH_PRESENT_PREV, this.quickSwitchPresentPrev)
    ipcRenderer.on(WB_MAILBOXES_WINDOW_OPEN_COMMAND_PALETTE, this.openCommandPalette)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SETTINGS, this.launchSettings)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_WAVEBOX_ACCOUNT, this.launchWaveboxAccount)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_SUPPORT_CENTER, this.launchSupportCenter)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.launchNews)
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_ADD_ACCOUNT, this.addAccount)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_NEXT, this.quickSwitchNext)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_PREV, this.quickSwitchPrev)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_PRESENT_NEXT, this.quickSwitchPresentNext)
    ipcRenderer.removeListener(WB_QUICK_SWITCH_PRESENT_PREV, this.quickSwitchPresentPrev)
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
    window.location.hash = window.location.hash === '#/command' || window.location.hash.startsWith('#/command/')
      ? ''
      : '/command'
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
  quickSwitchNext = (evt) => {
    window.location.hash = '/'
    accountActions.quickSwitchNextService()
  }

  /**
  * Quick switches to the prev account
  */
  quickSwitchPrev = (evt) => {
    window.location.hash = '/'
    accountActions.quickSwitchPrevService()
  }

  /**
  * Launches quick switch in next mode
  */
  quickSwitchPresentNext = (evt) => {
    window.location.hash = '/switcher/next'
  }

  /**
  * Launches quick switch in prev mode
  */
  quickSwitchPresentPrev = (evt) => {
    window.location.hash = '/switcher/prev'
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
