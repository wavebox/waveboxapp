import './ReactComponents.less'
const React = require('react')
const ReactDOM = require('react-dom')
const Provider = require('Scenes/Provider')
const mailboxActions = require('stores/mailbox/mailboxActions')
const settingsActions = require('stores/settings/settingsActions')
const composeActions = require('stores/compose/composeActions')
const updaterActions = require('stores/updater/updaterActions')
const userActions = require('stores/user/userActions')
const { ipcRenderer } = window.nativeRequire('electron')

// Load what we have in the db
userActions.load()
mailboxActions.load()
settingsActions.load()
composeActions.load()
updaterActions.load()

// Remove loading
;(() => {
  const loading = document.getElementById('loading')
  loading.parentElement.removeChild(loading)
})()

const injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

// Render and prepare for unrender
ReactDOM.render(<Provider />, document.getElementById('ReactComponent-AppScene'))
ipcRenderer.on('prepare-reload', () => {
  ReactDOM.unmountComponentAtNode(document.getElementById('ReactComponent-AppScene'))
  window.location.hash = '/'
})

ipcRenderer.send('mailboxes-js-loaded', {})
