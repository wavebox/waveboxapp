import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { webFrame } from 'electron'

// Prevent zooming
webFrame.setZoomLevelLimits(1, 1)

// Render
ReactDOM.render((<Provider />), document.getElementById('ReactComponent-AppScene'))
