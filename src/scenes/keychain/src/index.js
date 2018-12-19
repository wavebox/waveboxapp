import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { webFrame } from 'electron'
import { settingsStore, settingsActions } from 'stores/settings'
import TopLevelErrorBoundary from 'wbui/TopLevelErrorBoundary'
import i18n from 'i18n'
import Resolver from 'Runtime/Resolver'

// Prevent zooming
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(1, 1)

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
