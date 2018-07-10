import React from 'react'
import PropTypes from 'prop-types'
import MailboxTabManager from './Mailbox/MailboxTabManager'
import Sidelist from './Sidelist'
import { PrimaryToolbar, SecondaryToolbar } from './Toolbar'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsStore } from 'stores/settings'
import { crextensionStore } from 'stores/crextension'
import { accountStore } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const SIDEBAR_WIDTH = 70
const TOOLBAR_HEIGHT = 40
const styles = {
  master: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 'auto',
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 101,
    WebkitAppRegion: 'drag'
  },
  detail: {
    position: 'fixed',
    top: 0,
    left: SIDEBAR_WIDTH,
    right: 0,
    bottom: 0,
    '&.toolbars-1': { top: TOOLBAR_HEIGHT },
    '&.toolbars-2': { top: 2 * TOOLBAR_HEIGHT },
    '&.no-sidebar': { left: 0 }
  },
  toolbarWrap: {
    position: 'fixed',
    top: 0,
    left: SIDEBAR_WIDTH,
    right: 0,
    height: TOOLBAR_HEIGHT,
    zIndex: 101,
    WebkitAppRegion: 'drag',
    '&.toolbars-1': { height: TOOLBAR_HEIGHT },
    '&.toolbars-2': { height: 2 * TOOLBAR_HEIGHT },
    '&.no-sidebar': { left: 0 }
  },
  toolbar: {
    height: TOOLBAR_HEIGHT
  },
  titleDragbar: {
    position: 'absolute',
    top: 0,
    left: SIDEBAR_WIDTH,
    right: 0,
    height: 16,
    zIndex: 100,
    WebkitAppRegion: 'drag',
    '&.no-sidebar': { left: 0 }
  },
  mailboxTabManager: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}

@withStyles(styles)
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
    const { children, classes, ...passProps } = this.props
    const {
      hasSidebar,
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

    return (
      <div {...passProps}>
        {hasSidebar ? (
          <div className={classNames(classes.master, 'WB-Master')}>
            <Sidelist />
          </div>
        ) : undefined}
        {hasPrimaryToolbar || hasSecondaryToolbar ? (
          <div className={classNames(classes.toolbarWrap, `toolbars-${toolbarCount}`)}>
            {hasPrimaryToolbar ? (
              <PrimaryToolbar
                toolbarHeight={TOOLBAR_HEIGHT}
                className={classNames(classes.toolbar, !hasSidebar ? 'no-sidebar' : undefined)} />
            ) : undefined}
            {hasSecondaryToolbar ? (
              <SecondaryToolbar
                toolbarHeight={TOOLBAR_HEIGHT}
                className={classNames(classes.toolbar, !hasSidebar ? 'no-sidebar' : undefined)} />
            ) : undefined}
          </div>
        ) : undefined}
        {!appHasTitlebar ? (
          <div className={classNames(classes.titleDragbar, !hasSidebar ? 'no-siderbar' : undefined)} />
        ) : undefined}
        <div className={classNames(
          classes.detail,
          !hasSidebar ? 'no-sidebar' : undefined,
          `toolbars-${toolbarCount}`,
          'WB-Detail'
        )}>
          <MailboxTabManager style={styles.mailboxTabManager} />
        </div>
        {children}
      </div>
    )
  }
}

export default AppScene
