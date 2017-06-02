import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import browserActions from 'stores/browser/browserActions'
import injectTapEventPlugin from 'react-tap-event-plugin'
import querystring from 'querystring'

const { webFrame, ipcRenderer } = window.nativeRequire('electron')

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
browserActions.load()

// Parse our settings
const {
  url,
  partition
} = querystring.parse(window.location.search.slice(1))

// Render
injectTapEventPlugin()
ReactDOM.render((
  <Provider url={url} partition={partition} />
), document.getElementById('ReactComponent-AppScene'))

// Resource usage monitoring
ipcRenderer.on('ping-resource-usage', () => {
  ipcRenderer.send('pong-resource-usage', {
    ...process.getCPUUsage(),
    ...process.getProcessMemoryInfo(),
    pid: process.pid,
    description: `Content Window: ${document.title}`
  })
  document.querySelector('webview').send('ping-resource-usage', {
    description: `Content WebView: ${document.title}`
  })
})
