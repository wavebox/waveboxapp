import './AppScene.less'
import React from 'react'
import PropTypes from 'prop-types'
import MailboxTabManager from './Mailbox/MailboxTabManager'
import Sidelist from './Sidelist'
import ToolwindowExtensions from './ToolwindowExtensions'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsStore } from 'stores/settings'
import { extensionStore } from 'stores/extension'
import CoreExtensionManifest from 'shared/Models/Extensions/CoreExtensionManifest'

const SIDEBAR_WIDTH = 70
const styles = {
  master: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 'auto',
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 100,
    WebkitAppRegion: 'drag'
  },
  detail: {
    position: 'fixed',
    top: 0,
    left: SIDEBAR_WIDTH,
    right: 0,
    bottom: 0
  },
  mailboxTabManager: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  toolwindowExtensions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}

export default class AppScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
    extensionStore.listen(this.extensionUpdated)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
    extensionStore.unlisten(this.extensionUpdated)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const extensionState = extensionStore.getState()
    return {
      hasSidebar: settingsState.ui.sidebarEnabled,
      toolwindowExtBottom: extensionState
        .getInstalledWithToolwindows(CoreExtensionManifest.TOOLWINDOW_POSITIONS.BOTTOM)
        .map((extension) => extension.manifest.toolwindowSize)
        .reduce((a, b) => a + b, 0),
      toolwindowExtSidebarO: extensionState
        .getInstalledWithToolwindows(CoreExtensionManifest.TOOLWINDOW_POSITIONS.SIDEBAR_O)
        .map((extension) => extension.manifest.toolwindowSize)
        .reduce((a, b) => a + b, 0)
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      hasSidebar: settingsState.ui.sidebarEnabled
    })
  }

  extensionUpdated = (extensionState) => {
    this.setState({
      toolwindowExtBottom: extensionState
        .getInstalledWithToolwindows(CoreExtensionManifest.TOOLWINDOW_POSITIONS.BOTTOM)
        .map((extension) => extension.manifest.toolwindowSize)
        .reduce((a, b) => a + b, 0),
      toolwindowExtSidebarO: extensionState
        .getInstalledWithToolwindows(CoreExtensionManifest.TOOLWINDOW_POSITIONS.SIDEBAR_O)
        .map((extension) => extension.manifest.toolwindowSize)
        .reduce((a, b) => a + b, 0)
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { children, ...passProps } = this.props
    const {
      hasSidebar,
      toolwindowExtBottom,
      toolwindowExtSidebarO
     } = this.state

    return (
      <div {...passProps}>
        {hasSidebar ? (
          <div style={styles.master}>
            <Sidelist />
          </div>
        ) : undefined}
        <div style={{
          ...styles.detail,
          ...(hasSidebar ? {} : { left: 0 })
        }}>
          {toolwindowExtBottom ? (
            <ToolwindowExtensions
              position={CoreExtensionManifest.TOOLWINDOW_POSITIONS.BOTTOM}
              style={{
                ...styles.toolwindowExtensions,
                top: 'auto',
                height: toolwindowExtBottom
              }} />
          ) : undefined}
          {toolwindowExtSidebarO ? (
            <ToolwindowExtensions
              position={CoreExtensionManifest.TOOLWINDOW_POSITIONS.SIDEBAR_O}
              style={{
                ...styles.toolwindowExtensions,
                left: 'auto',
                width: toolwindowExtSidebarO
              }} />
          ) : undefined}
          <MailboxTabManager
            style={{
              ...styles.mailboxTabManager,
              right: toolwindowExtSidebarO,
              bottom: toolwindowExtBottom
            }} />
        </div>
        {this.props.children}
      </div>
    )
  }
}
