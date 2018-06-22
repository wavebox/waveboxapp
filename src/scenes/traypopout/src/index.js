import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { webFrame } from 'electron'
import { userStore, userActions } from 'stores/user'
import { accountStore, accountActions } from 'stores/account'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { notifhistStore, notifhistActions } from 'stores/notifhist'
import { settingsStore, settingsActions } from 'stores/settings'

// Load what we have in the db
userStore.getState()
userActions.load()
accountStore.getState()
accountActions.load()
emblinkStore.getState()
emblinkActions.load()
notifhistStore.getState()
notifhistActions.load()
settingsStore.getState()
settingsActions.load()

// Prevent zooming
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(1, 1)

// Prevent right click
window.addEventListener('contextmenu', (evt) => {
  evt.preventDefault()
  evt.stopPropagation()
}, false)

// Prevent Drag/Drop
document.addEventListener('drop', (evt) => {
  evt.preventDefault()
  evt.stopPropagation()
}, false)
document.addEventListener('dragover', (evt) => {
  evt.preventDefault()
  evt.stopPropagation()
}, false)

// Render
ReactDOM.render((<Provider />), document.getElementById('ReactComponent-AppScene'))
