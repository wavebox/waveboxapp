import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import monitorActions from 'stores/monitor/monitorActions'
import TopLevelErrorBoundary from 'wbui/TopLevelErrorBoundary'

// Load what we have in the db
monitorActions.load()

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
ReactDOM.render((
  <TopLevelErrorBoundary>
    <Provider />
  </TopLevelErrorBoundary>
), document.getElementById('ReactComponent-AppScene'))
