import React from 'react'
import ReactDOM from 'react-dom'
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
import { ipcRenderer } from 'electron'
import { WB_WINDOW_MIN_MAX_DBL_CLICK } from 'shared/ipcEvents'

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
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.titlebarRef = React.createRef()
    this.toolbarWrapRef = React.createRef()
    this.primaryToolbarRef = React.createRef()
    this.secondaryToolbarRef = React.createRef()
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
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the titlebar being double clicked
  */
  handleTitleDragbarDoubleClick = (evt) => {
    if (evt.target === ReactDOM.findDOMNode(this.titlebarRef.current)) {
      evt.preventDefault()
      evt.stopPropagation()
      ipcRenderer.send(WB_WINDOW_MIN_MAX_DBL_CLICK)
    }
  }

  /**
  * Handles the toolbar being double clicked
  */
  handleToolbarDoubleClick = (evt) => {
    if (
      evt.target === ReactDOM.findDOMNode(this.primaryToolbarRef.current) ||
      evt.target === ReactDOM.findDOMNode(this.secondaryToolbarRef.current) ||
      evt.target === ReactDOM.findDOMNode(this.toolbarWrapRef.current)
    ) {
      evt.preventDefault()
      evt.stopPropagation()
      ipcRenderer.send(WB_WINDOW_MIN_MAX_DBL_CLICK)
    }
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
          <div
            ref={this.toolbarWrapRef}
            onDoubleClick={appHasTitlebar ? undefined : this.handleToolbarDoubleClick}
            className={classNames(classes.toolbarWrap, sidebarClassNameMod, `toolbars-${toolbarCount}`)}>
            {hasPrimaryToolbar ? (
              <PrimaryToolbar
                innerRef={this.primaryToolbarRef}
                toolbarHeight={TOOLBAR_HEIGHT}
                className={classNames(
                  classes.toolbarPrimary,
                  !appHasTitlebar ? 'no-titlebar' : undefined,
                  sidebarClassNameMod
                )} />
            ) : undefined}
            {hasSecondaryToolbar ? (
              <SecondaryToolbar
                innerRef={this.secondaryToolbarRef}
                toolbarHeight={TOOLBAR_HEIGHT}
                className={classNames(classes.toolbarSecondary, sidebarClassNameMod)} />
            ) : undefined}
          </div>
        ) : undefined}
        {!appHasTitlebar ? (
          <div
            ref={this.titlebarRef}
            className={classNames(classes.titleDragbar, sidebarClassNameMod)}
            onDoubleClick={this.handleTitleDragbarDoubleClick} />
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
