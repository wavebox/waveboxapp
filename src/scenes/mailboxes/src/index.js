import './ReactComponents.less'
import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import mailboxActions from 'stores/mailbox/mailboxActions'
import settingsActions from 'stores/settings/settingsActions'
import composeActions from 'stores/compose/composeActions'
import updaterActions from 'stores/updater/updaterActions'
import userActions from 'stores/user/userActions'
import Debug from 'Debug'
import injectTapEventPlugin from 'react-tap-event-plugin'
const { ipcRenderer, webFrame } = window.nativeRequire('electron')

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
userActions.load()
mailboxActions.load()
settingsActions.load()
composeActions.load()
updaterActions.load()
Debug.load()

// Remove loading
;(() => {
  const loading = document.getElementById('loading')
  loading.parentElement.removeChild(loading)
})()

// Render and prepare for unrender
injectTapEventPlugin()
ReactDOM.render(<Provider />, document.getElementById('ReactComponent-AppScene'))
ipcRenderer.on('prepare-reload', () => {
  window.location.hash = '/'
})
window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(document.getElementById('ReactComponent-AppScene'))
})

ipcRenderer.send('mailboxes-js-loaded', {})

// Resource usage monitoring
ipcRenderer.on('ping-resource-usage', () => {
  ipcRenderer.send('pong-resource-usage', {
    ...process.getCPUUsage(),
    ...process.getProcessMemoryInfo(),
    pid: process.pid,
    description: `Mailboxes Window`
  })
})
