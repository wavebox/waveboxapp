import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { settingsStore } from 'stores/settings'
import { crextensionStore } from 'stores/crextension'
import shallowCompare from 'react-addons-shallow-compare'
import ToolbarMailboxServices from './ToolbarMailboxServices'
import ToolbarExtensions from './ToolbarExtensions'
import ToolbarNavigation from './ToolbarNavigation'
import { ExtensionSettings } from 'shared/Models/Settings'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import blueGrey from '@material-ui/core/colors/blueGrey'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'

const styles = {
  toolbar: {
    backgroundColor: blueGrey[900],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 70,
    '&.no-left-padd': { paddingLeft: 0 }
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  services: { },
  extensions: { },
  navigation: {
    width: '100%'
  }
}

@withStyles(styles)
class Toolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired
  }

  /**
  * Works out if the user has services in the toolbar
  * @param accountState=autoget: the mailbox state
  * @return true if there are services, false otherwise
  */
  static hasServicesInToolbar (accountState = accountStore.getState()) {
    const mailbox = accountState.activeMailbox()
    if (!mailbox) { return false }
    if (!mailbox.hasMultipleServices) { return false }
    if (mailbox.toolbarStartServices.length === 0 && mailbox.toolbarEndServices.length === 0) { return false }

    return true
  }

  /**
  * Works out if the user has extensions in the toolbar
  * @param crextensionState=autoget: the chrome extenion state
  * @param settingsState=autoget: the settings state
  * @return true if there are extensions, false otherwise
  */
  static hasExtensionsInToolbar (crextensionState = crextensionStore.getState(), settingsState = settingsStore.getState()) {
    if (!settingsState.extension.showBrowserActionsInToolbar) { return false }
    if (crextensionState.browserActionExtensionCount() === 0) { return false }
    return true
  }

  /**
  * Works out if the active servie has the navigation toolbar in the toolbar
  * @param accountState=autoget: the mailbox state
  * @return true if there are navigation controls
  */
  static hasNavigationInToolbar (accountState = accountStore.getState()) {
    const service = accountState.activeService()
    return service ? service.hasNavigationToolbar : false
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
    settingsStore.listen(this.settingsUpdated)
    crextensionStore.listen(this.crextensionUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
    settingsStore.unlisten(this.settingsUpdated)
    crextensionStore.unlisten(this.crextensionUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const settingsState = settingsStore.getState()
    const crextensionState = crextensionStore.getState()

    const mailbox = accountState.activeMailbox()
    return {
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(accountState),
      serviceId: accountState.activeServiceId(),
      ...(mailbox ? {
        mailboxId: mailbox.id,
        mailboxHasStartServices: !!mailbox.toolbarStartServices.length,
        mailboxHasEndServices: !!mailbox.toolbarEndServices.length
      } : undefined),
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(crextensionState, settingsState),
      hasNavigationInToolbar: Toolbar.hasNavigationInToolbar(accountState),
      extensionLayoutMode: settingsState.extension.toolbarBrowserActionLayout,
      showTitlebar: settingsState.ui.showTitlebar,
      sidebarEnabled: settingsState.ui.sidebarEnabled,
      activeTabId: accountState.getActiveWebcontentTabId()
    }
  })()

  accountUpdated = (accountState) => {
    const mailbox = accountState.activeMailbox()
    this.setState({
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(accountState),
      hasNavigationInToolbar: Toolbar.hasNavigationInToolbar(accountState),
      ...(mailbox ? {
        mailboxId: mailbox.id,
        mailboxHasStartServices: !!mailbox.toolbarStartServices.length,
        mailboxHasEndServices: !!mailbox.toolbarEndServices.length
      } : {
        mailboxId: undefined,
        mailboxHasStartServices: false,
        mailboxHasEndServices: false
      }),
      serviceId: accountState.activeServiceId(),
      activeTabId: accountState.getActiveWebcontentTabId()
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
      className,
      classes,
      ...passProps
    } = this.props
    const {
      hasServicesInToolbar,
      hasNavigationInToolbar,
      mailboxId,
      serviceId,
      mailboxHasStartServices,
      mailboxHasEndServices,
      hasExtensionsInToolbar,
      extensionLayoutMode,
      activeTabId,
      showTitlebar,
      sidebarEnabled
    } = this.state

    return (
      <div
        {...passProps}
        className={classNames(
          classes.toolbar,
          !showTitlebar && !sidebarEnabled ? undefined : 'no-left-padd',
          'WB-Toolbar',
          className
        )}
        style={{ height: toolbarHeight, ...style }}>
        <div className={classes.toolbarGroup}>
          {hasServicesInToolbar && mailboxHasStartServices ? (
            <ToolbarMailboxServices
              className={classes.services}
              mailboxId={mailboxId}
              uiLocation={ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
          {hasExtensionsInToolbar && extensionLayoutMode === ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT ? (
            <ToolbarExtensions
              className={classes.extension}
              tabId={activeTabId}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
        </div>
        {hasNavigationInToolbar ? (
          <ToolbarNavigation
            className={classes.navigation}
            tabId={activeTabId}
            toolbarHeight={toolbarHeight}
            mailboxId={mailboxId}
            serviceId={serviceId} />
        ) : undefined}
        <div className={classes.toolbarGroup}>
          {hasServicesInToolbar && mailboxHasEndServices ? (
            <ToolbarMailboxServices
              className={classes.services}
              mailboxId={mailboxId}
              uiLocation={ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
          {hasExtensionsInToolbar && extensionLayoutMode === ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT ? (
            <ToolbarExtensions
              className={classes.extension}
              tabId={activeTabId}
              toolbarHeight={toolbarHeight} />
          ) : undefined}
        </div>
      </div>
    )
  }
}

export default Toolbar
