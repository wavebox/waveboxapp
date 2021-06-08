import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import TopLevelErrorBoundary from 'wbui/TopLevelErrorBoundary'

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
