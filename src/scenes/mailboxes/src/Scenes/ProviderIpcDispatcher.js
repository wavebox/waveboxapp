import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsStore } from 'stores/settings'
import { NotificationRenderer } from 'Notifications'
import {
  WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import WBRPCRenderer from 'shared/WBRPCRenderer'

export default class ProviderIpcDispatcher extends React.Component {
  componentDidMount () {
    ipcRenderer.on(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_DOWNLOAD_COMPLETE, this.downloadCompleted)
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
      WBRPCRenderer.wavebox.openItem(req.path, true)
    }, req)
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
