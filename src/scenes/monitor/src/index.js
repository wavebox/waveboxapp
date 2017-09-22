import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import monitorActions from 'stores/monitor/monitorActions'
import { webFrame } from 'electron'

// Prevent zooming
webFrame.setZoomLevelLimits(1, 1)

// Load what we have in the db
monitorActions.load()

// Render
ReactDOM.render((<Provider />), document.getElementById('ReactComponent-AppScene'))
