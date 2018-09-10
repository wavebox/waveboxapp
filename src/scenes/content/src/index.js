import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import browserActions from 'stores/browser/browserActions'
import querystring from 'querystring'
import { WB_SEND_IPC_TO_CHILD } from 'shared/ipcEvents'
import { ipcRenderer, webFrame, remote } from 'electron'
import { settingsStore, settingsActions } from 'stores/settings'

// Prevent zooming
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(1, 1)

// Prevent right click
window.addEventListener('contextmenu', (evt) => {
  evt.preventDefault()
  evt.stopPropagation()
}, false)

// Prevent drag/drop
document.addEventListener('drop', (evt) => {
  if (evt.target.tagName !== 'INPUT' && evt.target.type !== 'file') {
    evt.preventDefault()
    evt.stopPropagation()
  }
}, false)
document.addEventListener('dragover', (evt) => {
  if (evt.target.tagName !== 'INPUT' && evt.target.type !== 'file') {
    evt.preventDefault()
    evt.stopPropagation()
  }
}, false)

// Load what we have in the db
settingsStore.getState()
settingsActions.load()

// Parse our settings
const {
  url,
  partition
} = querystring.parse(window.location.search.slice(1))

// Load what we have in the db
browserActions.load(url)

// Render
ReactDOM.render((
  <Provider url={url} partition={partition} />
), document.getElementById('ReactComponent-AppScene'))

// Message passing
ipcRenderer.on(WB_SEND_IPC_TO_CHILD, (evt, { id, channel, payload }) => {
  remote.webContents.fromId(id).send(channel, payload)
})
