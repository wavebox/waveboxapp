import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { webFrame } from 'electron'
import { userStore, userActions } from 'stores/user'
import { mailboxStore, mailboxActions } from 'stores/mailbox'

// Load what we have in the db
userStore.getState()
userActions.load()
mailboxStore.getState()
mailboxActions.load()

// Prevent zooming
webFrame.setZoomLevelLimits(1, 1)

// Render
ReactDOM.render((<Provider />), document.getElementById('ReactComponent-AppScene'))
