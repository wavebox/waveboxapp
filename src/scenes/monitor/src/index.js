import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import monitorActions from 'stores/monitor/monitorActions'
import { settingsStore, settingsActions } from 'stores/settings'
import { webFrame } from 'electron'
import TopLevelErrorBoundary from 'wbui/TopLevelErrorBoundary'
import Resolver from 'Runtime/Resolver'
import i18n from 'i18n'

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

// Load what we have in the db
monitorActions.load()
settingsStore.getState()
settingsActions.load()

// Language
i18n.autoInitialize(Resolver.locales(), settingsStore)

// Render
ReactDOM.render((
  <TopLevelErrorBoundary>
    <Provider />
  </TopLevelErrorBoundary>
), document.getElementById('ReactComponent-AppScene'))
