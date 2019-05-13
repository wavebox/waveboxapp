import React from 'react'
import WaveboxRouter from './WaveboxRouter'
import shallowCompare from 'react-addons-shallow-compare'
import THEME_MAPPING from 'wbui/Themes/ThemeMapping'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { accountStore, accountDispatch } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { slackActions } from 'stores/slack'
import { microsoftActions } from 'stores/microsoft'
import { updaterActions } from 'stores/updater'
import { Analytics, ServerVent } from 'Server'
import { NotificationService } from 'Notifications'
import Bootstrap from 'R/Bootstrap'
import AccountMessageDispatcher from './AccountMessageDispatcher'
import { Tray } from 'Components/Tray'
import { AppBadge, WindowTitle } from 'Components'
import ErrorBoundary from 'wbui/ErrorBoundary'
import classNames from 'classnames'
import ProviderIpcDispatcher from './ProviderIpcDispatcher'
import WBRPCRenderer from 'shared/WBRPCRenderer'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.customCSSElement = null
  }

  componentDidMount () {
    // STEP 0. Maintaining focus
    WBRPCRenderer.browserWindow.on('focus', this.handleFocusWebview)
    WBRPCRenderer.webContents.on('did-attach-webview', this.handleFocusWebview)
    this.refocusInterval = setInterval(this.handlePollFocusWebview, 500)

    // STEP 1. App services
    Analytics.startAutoreporting()
    ServerVent.start(Bootstrap.clientId, Bootstrap.clientToken)
    NotificationService.start()
    updaterActions.load()

    // STEP 2. Mailbox connections
    slackActions.connectAllServices()
    microsoftActions.startPollingUpdates()

    // STEP 3. Listen for self
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)

    // Step 4. Customizations
    if (this.state.uiSettings.customMainCSS) {
      this.renderCustomCSS(this.state.uiSettings.customMainCSS)
    }
  }

  componentWillUnmount () {
    WBRPCRenderer.browserWindow.removeListener('focus', this.handleFocusWebview)
    WBRPCRenderer.webContents.removeListener('did-attach-webview', this.handleFocusWebview)
    clearInterval(this.refocusInterval)

    // STEP 1. App services
    Analytics.stopAutoreporting()
    ServerVent.stop()
    NotificationService.stop()
    updaterActions.unload()

    // STEP 2. Mailbox connections
    slackActions.disconnectAllServices()
    microsoftActions.stopPollingUpdates()

    // STEP 3. Listening for self
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)

    // STEP 4. Customizations
    this.renderCustomCSS(null)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.uiSettings.customMainCSS !== this.state.uiSettings.customMainCSS) {
      this.renderCustomCSS(this.state.uiSettings.customMainCSS)
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const accountState = accountStore.getState()
    return {
      messagesUnreadCount: accountState.userUnreadCountForApp(),
      hasUnreadActivity: accountState.userUnreadActivityForApp(),
      uiSettings: settingsState.ui,
      showTray: settingsState.tray.show,
      activeMailboxId: accountState.activeMailboxId(),
      activeServiceId: accountState.activeServiceId()
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      messagesUnreadCount: accountState.userUnreadCountForApp(),
      hasUnreadActivity: accountState.userUnreadActivityForApp(),
      activeMailboxId: accountState.activeMailboxId(),
      activeServiceId: accountState.activeServiceId()
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      uiSettings: settingsState.ui,
      showTray: settingsState.tray.show
    })
  }

  /* **************************************************************************/
  // Focus lifecycle
  /* **************************************************************************/

  /**
  * Handles the window refocusing by pointing the focus back onto the active mailbox
  */
  handleFocusWebview = () => {
    if (window.location.hash.length <= 2) {
      accountDispatch.refocus()
    }
  }

  /**
  * Handles polling the webview to refocus
  */
  handlePollFocusWebview = () => {
    if (!document.activeElement || document.activeElement.tagName !== 'WEBVIEW') {
      if (window.location.hash.length <= 2) {
        accountDispatch.refocus()
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the custom css into the dom
  * @param css: the css to render
  */
  renderCustomCSS (css) {
    if (css) {
      if (!this.customCSSElement) {
        this.customCSSElement = document.createElement('style')
        this.customCSSElement.setAttribute('data-custom-css', 'true')
        document.head.appendChild(this.customCSSElement)
      }
      this.customCSSElement.innerHTML = css
    } else {
      if (this.customCSSElement) {
        this.customCSSElement.parentElement.removeChild(this.customCSSElement)
        this.customCSSElement = null
      }
    }
  }

  render () {
    const {
      showTray,
      uiSettings,
      messagesUnreadCount,
      hasUnreadActivity,
      activeMailboxId,
      activeServiceId
    } = this.state

    return (
      <div className={classNames('WB-Provider', `WB-Id-${activeMailboxId}-${activeServiceId}`)}>
        <MuiThemeProvider theme={THEME_MAPPING[uiSettings.theme]}>
          <WaveboxRouter />
        </MuiThemeProvider>
        <ErrorBoundary>
          <ProviderIpcDispatcher />
        </ErrorBoundary>
        <ErrorBoundary>
          <AccountMessageDispatcher />
        </ErrorBoundary>
        <ErrorBoundary>
          <WindowTitle />
        </ErrorBoundary>
        {showTray ? (
          <ErrorBoundary>
            <Tray
              unreadCount={messagesUnreadCount}
              hasUnreadActivity={hasUnreadActivity} />
          </ErrorBoundary>
        ) : undefined}
        {uiSettings.showAppBadge ? (
          <ErrorBoundary>
            <AppBadge
              unreadCount={messagesUnreadCount}
              hasUnreadActivity={hasUnreadActivity} />
          </ErrorBoundary>
        ) : undefined}
      </div>
    )
  }
}
