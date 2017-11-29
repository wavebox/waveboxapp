import PropTypes from 'prop-types'
import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import { mailboxStore } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import { crextensionStore } from 'stores/crextension'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import shallowCompare from 'react-addons-shallow-compare'
import ToolbarMailboxServices from './ToolbarMailboxServices'
import ToolbarExtensions from './ToolbarExtensions'
import { ExtensionSettings } from 'shared/Models/Settings'

const styles = {
  toolbar: {
    backgroundColor: Colors.blueGrey900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  services: {

  },
  extensions: {

  }
}

export default class Toolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired
  }

  /**
  * Works out if the user has services in the toolbar
  * @param mailboxState=autoget: the mailbox state
  * @param userState=autoget: the user state
  * @return true if there are services, false otherwise
  */
  static hasServicesInToolbar (mailboxState = mailboxStore.getState(), userState = userStore.getState()) {
    const mailbox = mailboxState.activeMailbox()
    if (!mailbox) { return false }
    if (mailbox.serviceDisplayMode !== CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR) { return false }
    if (!mailbox.hasAdditionalServices) { return false }
    if (!userState.user.hasServices) { return false }
    if (mailbox.enabledServiceTypes <= 1) { return false }
    return true
  }

  /**
  * Works out if the user has extensions in the toolbar
  * @param crextensionState=autoget: the chrome extenion state
  * @param settingsState=autoget: the settings state
  * @return true if there are extensions, false otherwise
  */
  static hasExtensionsInToolbar (crextensionState = crextensionStore.getState(), settingsState = settingsStore.getState()) {
    if (!settingsState.extension.enableChromeExperimental) { return false }
    if (!settingsState.extension.showBrowserActionsInToolbar) { return false }
    if (crextensionState.browserActionExtensionCount() === 0) { return false }
    return true
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    mailboxStore.listen(this.mailboxUpdated)
    settingsStore.listen(this.settingsUpdated)
    crextensionStore.listen(this.crextensionUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    mailboxStore.unlisten(this.mailboxUpdated)
    settingsStore.unlisten(this.settingsUpdated)
    crextensionStore.unlisten(this.crextensionUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()
    const settingsState = settingsStore.getState()
    const userState = userStore.getState()
    const crextensionState = crextensionStore.getState()
    const mailbox = mailboxState.activeMailbox()

    return {
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(mailboxState, userState),
      ...(mailbox ? {
        mailboxId: mailbox.id,
        mailboxLayoutMode: mailbox.serviceToolbarIconLayout
      } : undefined),
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(crextensionState, settingsState),
      extensionLayoutMode: settingsState.extension.toolbarBrowserActionLayout,
      showTitlebar: settingsState.ui.showTitlebar,
      sidebarEnabled: settingsState.ui.sidebarEnabled,
      activeMailboxTabId: mailboxState.getActiveWebcontentTabId()
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(undefined, userState)
    })
  }

  mailboxUpdated = (mailboxState) => {
    const mailbox = mailboxState.activeMailbox()
    this.setState({
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(mailboxState, undefined),
      ...(mailbox ? {
        mailboxId: mailbox.id,
        mailboxLayoutMode: mailbox.serviceToolbarIconLayout
      } : {
        mailboxId: undefined,
        mailboxLayoutMode: undefined
      }),
      activeMailboxTabId: mailboxState.getActiveWebcontentTabId()
    })
  }

  crextensionUpdated = (crextensionState) => {
    this.setState({
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(crextensionState, undefined)
    })
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      extensionLayoutMode: settingsState.extension.toolbarBrowserActionLayout,
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(undefined, settingsState),
      showTitlebar: settingsState.ui.showTitlebar,
      sidebarEnabled: settingsState.ui.sidebarEnabled
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      style,
      toolbarHeight,
      ...passProps
    } = this.props
    const {
      hasServicesInToolbar,
      mailboxId,
      mailboxLayoutMode,
      hasExtensionsInToolbar,
      extensionLayoutMode,
      activeMailboxTabId,
      showTitlebar,
      sidebarEnabled
    } = this.state

    return (
      <div
        {...passProps}
        style={{
          height: toolbarHeight,
          paddingLeft: !showTitlebar && !sidebarEnabled ? 70 : 0,
          ...styles.toolbar,
          ...style
        }}>
        <div style={styles.toolbarGroup}>
          {hasServicesInToolbar && mailboxLayoutMode === CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.LEFT_ALIGN ? (
            <ToolbarMailboxServices
              style={styles.services}
              mailboxId={mailboxId}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
          {hasExtensionsInToolbar && extensionLayoutMode === ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT ? (
            <ToolbarExtensions
              style={styles.extension}
              tabId={activeMailboxTabId}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
        </div>
        <div style={styles.toolbarGroup}>
          {hasServicesInToolbar && mailboxLayoutMode === CoreMailbox.SERVICE_TOOLBAR_ICON_LAYOUTS.RIGHT_ALIGN ? (
            <ToolbarMailboxServices
              style={styles.services}
              mailboxId={mailboxId}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
          {hasExtensionsInToolbar && extensionLayoutMode === ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT ? (
            <ToolbarExtensions
              style={styles.extension}
              tabId={activeMailboxTabId}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
        </div>
      </div>
    )
  }
}
