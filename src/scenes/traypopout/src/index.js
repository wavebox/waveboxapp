import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { webFrame } from 'electron'
import { userStore, userActions } from 'stores/user'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { notifhistStore, notifhistActions } from 'stores/notifhist'

// Load what we have in the db
userStore.getState()
userActions.load()
mailboxStore.getState()
mailboxActions.load()
emblinkStore.getState()
emblinkActions.load()
notifhistStore.getState()
notifhistActions.load()

// Prevent zooming
webFrame.setZoomLevelLimits(1, 1)

// Prevent right click
window.addEventListener('contextmenu', (evt) => {
  evt.preventDefault()
  evt.stopPropagation()
}, false)

// Render
ReactDOM.render((<Provider />), document.getElementById('ReactComponent-AppScene'))
