import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore, settingsActions } from 'stores/settings'
import { updaterStore, updaterActions } from 'stores/updater'
import { userStore, userActions } from 'stores/user'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { crextensionStore, crextensionActions } from 'stores/crextension'
import { platformStore, platformActions } from 'stores/platform'
import { guestStore, guestActions } from 'stores/guest'
import { localHistoryStore, localHistoryActions } from 'stores/localHistory'
import { EventEmitter } from 'events'
import Debug from 'Debug'
import ResourceMonitorResponder from './ResourceMonitorResponder'
import TopLevelErrorBoundary from 'wbui/TopLevelErrorBoundary'
import {
  WB_MAILBOXES_WINDOW_JS_LOADED,
  WB_MAILBOXES_WINDOW_REQUEST_GRACEFUL_RELOAD,
  WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import CrashReporterWatcher from 'shared/CrashReporter/CrashReporterWatcher'
import os from 'os'

// We often exceed 10 listeners so increase this
EventEmitter.defaultMaxListeners = 50

// Context menu
document.addEventListener('contextmenu', (evt) => {
  if (evt.target.tagName === 'INPUT' || evt.target.tagName === 'TEXTAREA') {
    return
  }

  let node = evt.target
  while (node.tagName !== 'BODY') {
    if (node.getAttribute('data-contextmenu-target') === 'true') { return }
    node = node.parentElement
  }

  evt.preventDefault()
  evt.stopPropagation()
})

// Prevent drag/drop
document.addEventListener('drop', (evt) => {
  // Don't invert this, some dom elements throw when calling .type
  if (evt.target.tagName === 'INPUT' && evt.target.type === 'file') {
    /* no-op */
  } else {
    evt.preventDefault()
    evt.stopPropagation()
  }
}, false)
document.addEventListener('dragover', (evt) => {
  // Don't invert this, some dom elements throw when calling .type
  if (evt.target.tagName === 'INPUT' && evt.target.type === 'file') {
    /* no-op */
  } else {
    evt.preventDefault()
    evt.stopPropagation()
  }
}, false)

// Load what we have in the db
userStore.getState()
userActions.load()
accountStore.getState()
accountActions.load()
settingsStore.getState()
settingsActions.load()
updaterStore.getState()
updaterActions.load()
crextensionStore.getState()
crextensionActions.load()
platformStore.getState()
platformActions.load()
emblinkStore.getState()
emblinkActions.load()
localHistoryStore.getState()
localHistoryActions.load()
guestStore.getState()
guestActions.load()

const crashReporter = new CrashReporterWatcher()
crashReporter.start(userStore, settingsStore, CrashReporterWatcher.RUNTIME_IDENTIFIERS.MAILBOXES, os.release())

// Setup the updaters
userActions.startAutoUpdateExtensions()
userActions.startAutoUpdateWireConfig()
userActions.startAutoUpdateContainers()
userActions.startAutoUploadUserProfile()

// Debugging
Debug.load()

// Remove loading
;(() => {
  const loading = document.getElementById('loading')
  loading.parentElement.removeChild(loading)
})()

// Render and prepare for unrender
ReactDOM.render((
  <TopLevelErrorBoundary>
    <Provider />
  </TopLevelErrorBoundary>
), document.getElementById('ReactComponent-AppSceneRenderNode'))
ipcRenderer.on(WB_MAILBOXES_WINDOW_REQUEST_GRACEFUL_RELOAD, () => {
  window.location.hash = '/'
  ReactDOM.unmountComponentAtNode(document.getElementById('ReactComponent-AppSceneRenderNode'))
  setTimeout(() => {
    ipcRenderer.send(WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD, {})
  })
})
window.addEventListener('beforeunload', () => {
  window.location.hash = '/'
  ReactDOM.unmountComponentAtNode(document.getElementById('ReactComponent-AppSceneRenderNode'))
})

ipcRenderer.send(WB_MAILBOXES_WINDOW_JS_LOADED, {})

// Resource usage monitoring
const resourceMonitorListener = new ResourceMonitorResponder()
resourceMonitorListener.listen()

// Prep any wizards
setTimeout(() => {
  const settingsState = settingsStore.getState()

  if (process.platform === 'linux' && !settingsState.app.hasSeenLinuxSetupMessage) {
    window.location.hash = '/setup/linux'
  }
}, 1000)

// Update our settings
settingsActions.glueCurrentUpdateChannel.defer()
