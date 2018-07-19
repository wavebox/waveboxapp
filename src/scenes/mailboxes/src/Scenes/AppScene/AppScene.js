import React from 'react'
import PropTypes from 'prop-types'
import MailboxTabManager from './MailboxTabManager'
import Sidelist from './Sidelist'
import { PrimaryToolbar, SecondaryToolbar } from './Toolbar'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsStore } from 'stores/settings'
import { crextensionStore } from 'stores/crextension'
import { accountStore } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ThemeTools from 'wbui/Themes/ThemeTools'

const SIDEBAR_WIDTH_REGULAR = 70
const SIDEBAR_WIDTH_COMPACT = 55
const SIDEBAR_WIDTH_TINY = 40
const TOOLBAR_HEIGHT = 40
const styles = (theme) => ({
  master: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 'auto',
    bottom: 0,
    zIndex: 101,
    WebkitAppRegion: 'drag',
    '&.sidebar-regular': { width: SIDEBAR_WIDTH_REGULAR },
    '&.sidebar-compact': { width: SIDEBAR_WIDTH_COMPACT },
    '&.sidebar-tiny': { width: SIDEBAR_WIDTH_TINY }
  },
  detail: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    '&.sidebar-regular': { left: SIDEBAR_WIDTH_REGULAR },
    '&.sidebar-compact': { left: SIDEBAR_WIDTH_COMPACT },
    '&.sidebar-tiny': { left: SIDEBAR_WIDTH_TINY },
    '&.sidebar-none': { left: 0 },
    '&.toolbars-1': { top: TOOLBAR_HEIGHT },
    '&.toolbars-2': { top: 2 * TOOLBAR_HEIGHT }
  },
  toolbarWrap: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: TOOLBAR_HEIGHT,
    zIndex: 101,
    WebkitAppRegion: 'drag',
    boxShadow: ThemeTools.getValue(theme, 'wavebox.toolbar.boxShadow'),
    '&.sidebar-regular': { left: SIDEBAR_WIDTH_REGULAR },
    '&.sidebar-compact': { left: SIDEBAR_WIDTH_COMPACT },
    '&.sidebar-tiny': { left: SIDEBAR_WIDTH_TINY },
    '&.sidebar-none': { left: 0 },
    '&.toolbars-1': { height: TOOLBAR_HEIGHT },
    '&.toolbars-2': { height: 2 * TOOLBAR_HEIGHT }
  },
  toolbarPrimary: {
    height: TOOLBAR_HEIGHT,
    '&.no-titlebar.sidebar-regular': { paddingLeft: 70 - SIDEBAR_WIDTH_REGULAR },
    '&.no-titlebar.sidebar-compact': { paddingLeft: 70 - SIDEBAR_WIDTH_COMPACT },
    '&.no-titlebar.sidebar-tiny': { paddingLeft: 70 - SIDEBAR_WIDTH_TINY },
    '&.no-titlebar.sidebar-none': { paddingLeft: 70 }
  },
  toolbarSecondary: {
    height: TOOLBAR_HEIGHT
  },
  titleDragbar: {
    position: 'absolute',
    top: 0,
    left: 70,
    right: 0,
    height: 16,
    zIndex: 100,
    WebkitAppRegion: 'drag',
    '&.sidebar-regular': { left: SIDEBAR_WIDTH_REGULAR },
    '&.sidebar-compact': { left: SIDEBAR_WIDTH_COMPACT },
    '&.sidebar-tiny': { left: SIDEBAR_WIDTH_TINY },
    '&.sidebar-none': { left: 0 }
  },
  mailboxTabManager: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
})

@withStyles(styles, { withTheme: true })
class AppScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
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
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const settingsState = settingsStore.getState()
    const crextensionState = crextensionStore.getState()

    return {
      hasSidebar: settingsState.ui.sidebarEnabled,
      sidebarSize: settingsState.ui.sidebarSize,
      appHasTitlebar: settingsState.launched.ui.showTitlebar,
      hasExtensionsInPrimaryToolbar: PrimaryToolbar.hasExtensionsInToolbar(crextensionState, settingsState),
      hasServicesInPrimaryToolbar: PrimaryToolbar.hasServicesInToolbar(accountState),
      hasNavigationInPrimaryToolbar: PrimaryToolbar.hasNavigationInToolbar(accountState),
      hasNavigationInSecondaryToolbar: SecondaryToolbar.hasNavigationInToolbar(accountState)
    }
  })()

  settingsUpdated = (settingsState) => {
    const crextensionState = crextensionStore.getState()
    this.setState({
      hasSidebar: settingsState.ui.sidebarEnabled,
      sidebarSize: settingsState.ui.sidebarSize,
      hasExtensionsInPrimaryToolbar: PrimaryToolbar.hasExtensionsInToolbar(crextensionState, settingsState)
    })
  }

  accountUpdated = (accountState) => {
    this.setState({
      hasServicesInPrimaryToolbar: PrimaryToolbar.hasServicesInToolbar(accountState),
      hasNavigationInPrimaryToolbar: PrimaryToolbar.hasNavigationInToolbar(accountState),
      hasNavigationInSecondaryToolbar: SecondaryToolbar.hasNavigationInToolbar(accountState)
    })
  }

  crextensionUpdated = (crextensionState) => {
    const settingsState = settingsStore.getState()
    this.setState({
      hasExtensionsInPrimaryToolbar: PrimaryToolbar.hasExtensionsInToolbar(crextensionState, settingsState)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { children, classes, theme, ...passProps } = this.props
    const {
      hasSidebar,
      sidebarSize,
      appHasTitlebar,
      hasExtensionsInPrimaryToolbar,
      hasServicesInPrimaryToolbar,
      hasNavigationInPrimaryToolbar,
      hasNavigationInSecondaryToolbar
    } = this.state
    const hasPrimaryToolbar =
      hasExtensionsInPrimaryToolbar ||
      hasServicesInPrimaryToolbar ||
      hasNavigationInPrimaryToolbar
    const hasSecondaryToolbar =
      hasNavigationInSecondaryToolbar
    const toolbarCount = [hasPrimaryToolbar, hasSecondaryToolbar].reduce((acc, has) => {
      return has ? acc + 1 : acc
    }, 0)
    const sidebarClassNameMod = !hasSidebar ? 'sidebar-none' : `sidebar-${sidebarSize.toLowerCase()}`

    return (
      <div {...passProps}>
        {hasSidebar ? (
          <div className={classNames(classes.master, sidebarClassNameMod, 'WB-Master')}>
            <Sidelist />
          </div>
        ) : undefined}
        {hasPrimaryToolbar || hasSecondaryToolbar ? (
          <div className={classNames(classes.toolbarWrap, sidebarClassNameMod, `toolbars-${toolbarCount}`)}>
            {hasPrimaryToolbar ? (
              <PrimaryToolbar
                toolbarHeight={TOOLBAR_HEIGHT}
                className={classNames(
                  classes.toolbarPrimary,
                  !appHasTitlebar ? 'no-titlebar' : undefined,
                  sidebarClassNameMod
                )} />
            ) : undefined}
            {hasSecondaryToolbar ? (
              <SecondaryToolbar
                toolbarHeight={TOOLBAR_HEIGHT}
                className={classNames(classes.toolbarSecondary, sidebarClassNameMod)} />
            ) : undefined}
          </div>
        ) : undefined}
        {!appHasTitlebar ? (
          <div className={classNames(classes.titleDragbar, sidebarClassNameMod)} />
        ) : undefined}
        <div className={classNames(classes.detail, sidebarClassNameMod, `toolbars-${toolbarCount}`, 'WB-Detail')}>
          <MailboxTabManager className={classes.mailboxTabManager} />
        </div>
        {children}
      </div>
    )
  }
}

export default AppScene
