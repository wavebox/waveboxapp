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
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import { TOOLBAR_AUTO_SPLIT_THRESHOLD } from 'shared/constants'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  toolbar: {
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.toolbar.backgroundColor'),
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
  services: { },
  extensions: { },
  navigation: {
    width: 0,
    flexBasis: '100%'
  }
})

@withStyles(styles, { withTheme: true })
class PrimaryToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired
  }

  /**
  * Works out if the user has services in the toolbar
  * @param accountState: the mailbox state
  * @return true if there are services, false otherwise
  */
  static hasServicesInToolbar (accountState) {
    const mailbox = accountState.activeMailbox()
    if (!mailbox) { return false }
    if (!mailbox.hasMultipleServices) { return false }
    if (mailbox.toolbarStartServices.length === 0 && mailbox.toolbarEndServices.length === 0) { return false }

    return true
  }

  /**
  * Works out if the user has extensions in the toolbar
  * @param crextensionState: the chrome extenion state
  * @param settingsState: the settings state
  * @return true if there are extensions, false otherwise
  */
  static hasExtensionsInToolbar (crextensionState, settingsState) {
    if (!settingsState.extension.showBrowserActionsInToolbar) { return false }
    if (crextensionState.browserActionExtensionCount() === 0) { return false }
    return true
  }

  /**
  * Works out if the active servie has the navigation toolbar in the toolbar
  * @param accountState: the mailbox state
  * @return true if there are navigation controls
  */
  static hasNavigationInToolbar (accountState) {
    const mailbox = accountState.activeMailbox()
    const service = accountState.activeService()
    if (!mailbox || !service) { return false }

    if (service.hasNavigationToolbar) {
      if (mailbox.navigationBarUiLocation === ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.PRIMARY_TOOLBAR) {
        return true
      } else if (mailbox.navigationBarUiLocation === ACMailbox.NAVIGATION_BAR_UI_LOCATIONS.AUTO) {
        if (mailbox.toolbarStartServices.length + mailbox.toolbarEndServices.length <= TOOLBAR_AUTO_SPLIT_THRESHOLD) {
          return true
        }
      }
    }

    return false
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

    return {
      ...this.deriveExtensionState(settingsState, crextensionState),
      ...this.deriveSettingsState(settingsState),
      ...this.deriveAccountState(accountState)
    }
  })()

  accountUpdated = (accountState) => {
    this.setState(this.deriveAccountState(accountState))
  }

  crextensionUpdated = (crextensionState) => {
    this.setState(this.deriveExtensionState(settingsStore.getState(), crextensionState))
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      ...this.deriveExtensionState(settingsState, crextensionStore.getState()),
      ...this.deriveSettingsState(settingsState)
    })
  }

  /**
  * Derives the extension state
  * @param settingsState: the settings state
  * @param crextensionState: the extension store state
  * @return state update
  */
  deriveExtensionState (settingsState, crextensionState) {
    return {
      hasExtensionsInToolbar: PrimaryToolbar.hasExtensionsInToolbar(crextensionState, settingsState)
    }
  }

  /**
  * Derives the setting state
  * @param settingsState: the settings state
  * @return state update
  */
  deriveSettingsState (settingsState) {
    return {
      extensionLayoutMode: settingsState.extension.toolbarBrowserActionLayout
    }
  }

  /**
  * Derives the account state from the stores
  * @param accountState: the current account store state
  * @return state update
  */
  deriveAccountState (accountState) {
    const mailbox = accountState.activeMailbox()
    const service = accountState.activeService()

    return {
      activeTabId: accountState.getActiveWebcontentTabId(),
      ...(mailbox ? {
        mailboxId: mailbox.id,
        mailboxHasStartServices: mailbox.hasMultipleServices && mailbox.toolbarStartServices.length,
        mailboxHasEndServices: mailbox.hasMultipleServices && mailbox.toolbarEndServices.length,
        hasServicesInToolbar: PrimaryToolbar.hasServicesInToolbar(accountState)
      } : {
        mailboxId: undefined,
        mailboxHasStartServices: false,
        mailboxHasEndServices: false,
        hasServicesInToolbar: false
      }),
      ...(service ? {
        serviceId: service.id,
        hasNavigationInToolbar: PrimaryToolbar.hasNavigationInToolbar(accountState)
      } : {
        serviceId: undefined,
        hasNavigationInToolbar: false
      })
    }
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
      theme,
      ...passProps
    } = this.props
    const {
      hasNavigationInToolbar,
      mailboxId,
      serviceId,
      mailboxHasStartServices,
      mailboxHasEndServices,
      hasExtensionsInToolbar,
      extensionLayoutMode,
      activeTabId
    } = this.state

    return (
      <div
        {...passProps}
        className={classNames(
          classes.toolbar,
          'WB-Primary-Toolbar',
          className
        )}
        style={{ height: toolbarHeight, ...style }}>
        <div className={classes.toolbarGroup}>
          {mailboxHasStartServices ? (
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
          {mailboxHasEndServices ? (
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

export default PrimaryToolbar
