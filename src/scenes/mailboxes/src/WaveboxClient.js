import React from 'react'
import ReactDOM from 'react-dom'
import Provider from 'Scenes/Provider'
import {accountStore, accountActions, accountDispatch} from 'stores/account'
import {settingsStore, settingsActions} from 'stores/settings'
import {updaterStore, updaterActions} from 'stores/updater'
import {userStore, userActions} from 'stores/user'
import {emblinkStore, emblinkActions} from 'stores/emblink'
import {crextensionStore, crextensionActions} from 'stores/crextension'
import {platformStore, platformActions} from 'stores/platform'
import {guestStore, guestActions} from 'stores/guest'
import {notifhistStore, notifhistActions} from 'stores/notifhist'
import Debug from 'Debug'
import MouseNavigationDarwin from 'wbui/MouseNavigationDarwin'
import ResourceMonitorResponder from './ResourceMonitorResponder'
import {
  WB_MAILBOXES_WINDOW_JS_LOADED,
  WB_MAILBOXES_WINDOW_REQUEST_GRACEFUL_RELOAD,
  WB_MAILBOXES_WINDOW_ACCEPT_GRACEFUL_RELOAD
} from 'shared/ipcEvents'
import { ipcRenderer, webFrame } from 'electron'

// Prevent zooming
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(1, 1)

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
const settingsState = settingsStore.getState()
settingsActions.load()
updaterStore.getState()
updaterActions.load()
crextensionStore.getState()
crextensionActions.load()
platformStore.getState()
platformActions.load()
emblinkStore.getState()
emblinkActions.load()
notifhistStore.getState()
notifhistActions.load()
guestStore.getState()
guestActions.load()

// Setup the updaters
userActions.startAutoUpdateExtensions()
userActions.startAutoUpdateWireConfig()
userActions.startAutoUpdateContainers()
userActions.startAutoUploadUserProfile()

// Navigation
if (process.platform === 'darwin' && settingsState.launched.app.enableMouseNavigationDarwin) {
  const mouseNavigator = new MouseNavigationDarwin(
    () => accountDispatch.navigateBack(),
    () => accountDispatch.navigateForward()
  )
  mouseNavigator.register()
  window.addEventListener('beforeunload', () => {
    mouseNavigator.unregister()
  })
}

// Debugging
Debug.load()

// Remove loading
;(() => {
  const loading = document.getElementById('loading')
  loading.parentElement.removeChild(loading)
})()

// Render and prepare for unrender
ReactDOM.render(<Provider />, document.getElementById('ReactComponent-AppSceneRenderNode'))
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
