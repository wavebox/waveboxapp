import React from 'react'
import PropTypes from 'prop-types'
import MailboxTabManager from './Mailbox/MailboxTabManager'
import Sidelist from './Sidelist'
import Toolbar from './Toolbar'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsStore } from 'stores/settings'
import { crextensionStore } from 'stores/crextension'
import { userStore } from 'stores/user'
import { mailboxStore } from 'stores/mailbox'
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
    top: TOOLBAR_HEIGHT,
    left: SIDEBAR_WIDTH,
    right: 0,
    bottom: 0,
    '&.no-sidebar': { left: 0 },
    '&.no-toolbar': { top: 0 }
  },
  toolbar: {
    position: 'fixed',
    top: 0,
    left: SIDEBAR_WIDTH,
    right: 0,
    height: TOOLBAR_HEIGHT,
    zIndex: 101,
    WebkitAppRegion: 'drag',
    '&.no-sidebar': { left: 0 }
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
    settingsStore.listen(this.settingsUpdated)
    userStore.listen(this.userUpdated)
    mailboxStore.listen(this.mailboxUpdated)
    crextensionStore.listen(this.crextensionUpdated)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
    userStore.unlisten(this.userUpdated)
    mailboxStore.unlisten(this.mailboxUpdated)
    crextensionStore.unlisten(this.crextensionUpdated)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()
    const crextensionState = crextensionStore.getState()

    return {
      hasSidebar: settingsState.ui.sidebarEnabled,
      appHasTitlebar: settingsState.launched.ui.showTitlebar,
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(crextensionState, settingsState),
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(mailboxState, userState),
      hasNavigationInToolbar: Toolbar.hasNavigationInToolbar(mailboxState)
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      hasSidebar: settingsState.ui.sidebarEnabled,
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(undefined, settingsState)
    })
  }

  userUpdated = (userState) => {
    this.setState({
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(undefined, userState)
    })
  }

  mailboxUpdated = (mailboxState) => {
    this.setState({
      hasServicesInToolbar: Toolbar.hasServicesInToolbar(mailboxState, undefined),
      hasNavigationInToolbar: Toolbar.hasNavigationInToolbar(mailboxState)
    })
  }

  crextensionUpdated = (crextensionState) => {
    this.setState({
      hasExtensionsInToolbar: Toolbar.hasExtensionsInToolbar(crextensionState, undefined)
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
      hasExtensionsInToolbar,
      hasServicesInToolbar,
      hasNavigationInToolbar
    } = this.state
    const hasToolbar = hasExtensionsInToolbar || hasServicesInToolbar || hasNavigationInToolbar

    return (
      <div {...passProps}>
        {hasSidebar ? (
          <div className={classNames(classes.master, 'WB-Mater')}>
            <Sidelist />
          </div>
        ) : undefined}
        {hasToolbar ? (
          <Toolbar
            toolbarHeight={TOOLBAR_HEIGHT}
            className={classNames(classes.toolbar, !hasSidebar ? 'no-sidebar' : undefined)} />
        ) : undefined}
        {!appHasTitlebar ? (
          <div className={classNames(classes.titleDragbar, !hasSidebar ? 'no-siderbar' : undefined)} />
        ) : undefined}
        <div className={classNames(
          classes.detail,
          !hasSidebar ? 'no-sidebar' : undefined,
          !hasToolbar ? 'no-toolbar' : undefined,
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
