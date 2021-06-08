import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { userStore, userActions } from 'stores/user'
import { accountStore, accountActions } from 'stores/account'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { localHistoryStore, localHistoryActions } from 'stores/localHistory'
import { settingsStore, settingsActions } from 'stores/settings'
import CrashReporterWatcher from 'shared/CrashReporter/CrashReporterWatcher'
import os from 'os'
import TopLevelErrorBoundary from 'wbui/TopLevelErrorBoundary'

// Load what we have in the db
userStore.getState()
userActions.load()
accountStore.getState()
accountActions.load()
emblinkStore.getState()
emblinkActions.load()
localHistoryStore.getState()
localHistoryActions.load()
settingsStore.getState()
settingsActions.load()

const crashReporter = new CrashReporterWatcher()
crashReporter.start(userStore, settingsStore, CrashReporterWatcher.RUNTIME_IDENTIFIERS.TRAY, os.release())

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
