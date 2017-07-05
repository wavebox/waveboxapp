import './ReactComponents.less'
import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import {mailboxStore, mailboxActions} from 'stores/mailbox'
import {settingsStore, settingsActions} from 'stores/settings'
import {composeStore, composeActions} from 'stores/compose'
import {updaterStore, updaterActions} from 'stores/updater'
import {userStore, userActions} from 'stores/user'
import {extensionStore, extensionActions} from 'stores/extension'
import Debug from 'Debug'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {
  WB_MAILBOXES_WINDOW_JS_LOADED,
  WB_MAILBOXES_WINDOW_PREPARE_RELOAD,
  WB_PING_RESOURCE_USAGE,
  WB_PONG_RESOURCE_USAGE,
  WB_SEND_IPC_TO_CHILD
} from 'shared/ipcEvents'
const { ipcRenderer, webFrame, remote } = window.nativeRequire('electron')

// Prevent zooming
webFrame.setZoomLevelLimits(1, 1)

// Prevent drag/drop
document.addEventListener('drop', (evt) => {
  if (evt.target.tagName !== 'INPUT' && evt.target.type !== 'file') {
    evt.preventDefault()
    evt.stopPropagation()
  }
})
document.addEventListener('dragover', (evt) => {
  if (evt.target.tagName !== 'INPUT' && evt.target.type !== 'file') {
    evt.preventDefault()
    evt.stopPropagation()
  }
})

// Load what we have in the db
userStore.getState()
userActions.load()
mailboxStore.getState()
mailboxActions.load()
settingsStore.getState()
settingsActions.load()
composeStore.getState()
composeActions.load()
updaterStore.getState()
updaterActions.load()
extensionStore.getState()
extensionActions.load()
Debug.load()

// Remove loading
;(() => {
  const loading = document.getElementById('loading')
  loading.parentElement.removeChild(loading)
})()

// Render and prepare for unrender
injectTapEventPlugin()
ReactDOM.render(<Provider />, document.getElementById('ReactComponent-AppSceneRenderNode'))
ipcRenderer.on(WB_MAILBOXES_WINDOW_PREPARE_RELOAD, () => {
  window.location.hash = '/'
})
window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(document.getElementById('ReactComponent-AppSceneRenderNode'))
})

ipcRenderer.send(WB_MAILBOXES_WINDOW_JS_LOADED, {})

// Resource usage monitoring
ipcRenderer.on(WB_PING_RESOURCE_USAGE, () => {
  ipcRenderer.send(WB_PONG_RESOURCE_USAGE, {
    ...process.getCPUUsage(),
    ...process.getProcessMemoryInfo(),
    pid: process.pid,
    description: `Mailboxes Window`
  })
})

// Message passing
ipcRenderer.on(WB_SEND_IPC_TO_CHILD, (evt, { id, channel, payload }) => {
  remote.webContents.fromId(id).send(channel, payload)
})
