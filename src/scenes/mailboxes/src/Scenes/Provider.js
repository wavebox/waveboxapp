const React = require('react')
const Router = require('./Router')
const TimerMixin = require('react-timer-mixin')
const constants = require('shared/constants')
const shallowCompare = require('react-addons-shallow-compare')
const Theme = require('shared/Components/Theme')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default
const { mailboxStore, mailboxDispatch } = require('stores/mailbox')
const { settingsStore } = require('stores/settings')
const { googleActions } = require('stores/google')
const { trelloActions } = require('stores/trello')
const { slackActions } = require('stores/slack')
const { microsoftActions } = require('stores/microsoft')
const { mailboxActions } = require('stores/mailbox')
const { updaterActions } = require('stores/updater')
const { Analytics, ServerVent } = require('Server')
const { NotificationService } = require('Notifications')
const Bootstrap = require('R/Bootstrap')
const AccountMessageDispatcher = require('./AccountMessageDispatcher')
const {
  ipcRenderer, remote: {shell}
} = window.nativeRequire('electron')
const {
  Tray: { Tray },
  AppBadge
} = require('Components')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AppProvider',
  mixins: [TimerMixin],

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.forceFocusTO = null

    // STEP 1. App services
    Analytics.startAutoreporting()
    ServerVent.start(Bootstrap.clientId, Bootstrap.clientToken)
    NotificationService.start()
    updaterActions.load()
    updaterActions.checkForUpdates()
    ipcRenderer.on('download-completed', this.downloadCompleted)
    ipcRenderer.on('launch-settings', this.ipcLaunchSettings)

    // STEP 2. Mailbox connections
    mailboxActions.connectAllMailboxes()
    googleActions.startPollingUpdates()
    trelloActions.startPollingUpdates()
    microsoftActions.startPollingUpdates()

    // STEP 3. Listen for self
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)
    mailboxDispatch.on('blurred', this.mailboxBlurred)
  },

  componentWillUnmount () {
    // STEP 1. App services
    Analytics.stopAutoreporting()
    ServerVent.stop()
    NotificationService.stop()
    updaterActions.unload()
    ipcRenderer.removeListener('download-completed', this.downloadCompleted)
    ipcRenderer.removeListener('launch-settings', this.ipcLaunchSettings)

    // STEP 2. Mailbox connections
    mailboxActions.disconnectAllMailboxes()
    googleActions.stopPollingUpdates()
    trelloActions.stopPollingUpdates()
    slackActions.disconnectAllMailboxes()
    microsoftActions.stopPollingUpdates()

    // STEP 3. Listening for self
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)
    mailboxDispatch.removeListener('blurred', this.mailboxBlurred)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const settingsState = settingsStore.getState()
    const mailboxState = mailboxStore.getState()
    return {
      messagesUnreadCount: mailboxState.totalUnreadCountForAppBadge(),
      otherUnreadIndicator: mailboxState.hasOtherUnreadForAppBadge(),
      uiSettings: settingsState.ui,
      traySettings: settingsState.tray
    }
  },

  mailboxesChanged (mailboxState) {
    this.setState({
      messagesUnreadCount: mailboxState.totalUnreadCountForAppBadge(),
      otherUnreadIndicator: mailboxState.hasOtherUnreadForAppBadge()
    })
  },

  settingsChanged (settingsStore) {
    this.setState({
      uiSettings: settingsStore.ui,
      traySettings: settingsStore.tray
    })
  },

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Shows a notification of a completed download
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  downloadCompleted (evt, req) {
    const notification = new window.Notification('Download Completed', {
      body: req.filename
    })
    notification.onclick = function () {
      shell.openItem(req.path) || shell.showItemInFolder(req.path)
    }
  },

  /**
  * Launches the settings over the IPC channel
  */
  ipcLaunchSettings () {
    window.location.hash = '/settings'
  },

  /* **************************************************************************/
  // Rendering Events
  /* **************************************************************************/

  /**
  * Handles a mailbox bluring by trying to refocus the mailbox
  * @param evt: the event that fired
  */
  mailboxBlurred (evt) {
    // Requeue the event to run on the end of the render cycle
    this.setTimeout(() => {
      const active = document.activeElement
      if (active.tagName === 'WEBVIEW') {
        // Nothing to do, already focused on mailbox
        this.clearInterval(this.forceFocusTO)
      } else if (active.tagName === 'BODY') {
        // Focused on body, just dip focus onto the webview
        this.clearInterval(this.forceFocusTO)
        mailboxDispatch.refocus()
      } else {
        // focused on some element in the ui, poll until we move back to body
        this.forceFocusTO = this.setInterval(() => {
          if (document.activeElement.tagName === 'BODY') {
            this.clearInterval(this.forceFocusTO)
            mailboxDispatch.refocus()
          }
        }, constants.REFOCUS_MAILBOX_INTERVAL_MS)
      }
    }, constants.REFOCUS_MAILBOX_INTERVAL_MS)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { traySettings, uiSettings, messagesUnreadCount, otherUnreadIndicator } = this.state

    // Update the app title
    if (uiSettings.showTitlebarCount) {
      if (messagesUnreadCount === 0) {
        document.title = 'Wavebox'
      } else {
        document.title = `Wavebox (${messagesUnreadCount})`
      }
    } else {
      document.title = 'Wavebox'
    }

    return (
      <div>
        <MuiThemeProvider muiTheme={Theme}>
          <Router />
        </MuiThemeProvider>
        <AccountMessageDispatcher />
        {!traySettings.show ? undefined : (
          <Tray
            unreadCount={messagesUnreadCount}
            traySettings={traySettings} />
        )}
        {!uiSettings.showAppBadge ? undefined : (
          <AppBadge
            unreadCount={messagesUnreadCount}
            hasOtherUnreadIndicator={otherUnreadIndicator} />
        )}
      </div>
    )
  }
})
