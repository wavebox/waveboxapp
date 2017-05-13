import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import monitorActions from 'stores/monitor/monitorActions'
import injectTapEventPlugin from 'react-tap-event-plugin'

const { webFrame } = window.nativeRequire('electron')

// Prevent zooming
webFrame.setZoomLevelLimits(1, 1)

// Load what we have in the db
monitorActions.load()

// Render
injectTapEventPlugin()
ReactDOM.render((<Provider />), document.getElementById('ReactComponent-AppScene'))
