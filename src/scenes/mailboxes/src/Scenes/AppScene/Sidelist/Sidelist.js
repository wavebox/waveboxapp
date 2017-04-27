import React from 'react'
import { FontIcon, IconButton } from 'material-ui'
import SidelistMailboxes from './SidelistMailboxes'
import SidelistItemAddMailbox from './SidelistItemAddMailbox'
import SidelistItemSettings from './SidelistItemSettings'
import SidelistItemWizard from './SidelistItemWizard'
import SidelistItemPro from './SidelistItemPro'
import { settingsStore } from 'stores/settings'
import { userStore } from 'stores/user'
import styles from './SidelistStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

const { remote } = window.nativeRequire('electron')

export default class Sidelist extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
    userStore.listen(this.userUpdated)
    if (process.platform !== 'darwin') {
      remote.getCurrentWindow().on('maximize', this.handleWindowMaximize)
      remote.getCurrentWindow().on('unmaximize', this.handleWindowUnmaximize)
    }
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
    userStore.unlisten(this.userUpdated)
    if (process.platform !== 'darwin') {
      remote.getCurrentWindow().removeEventListener('maximize', this.handleWindowMaximize)
      remote.getCurrentWindow().removeEventListener('unmaximize', this.handleWindowUnmaximize)
    }
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const userState = userStore.getState()
    return {
      showTitlebar: settingsState.ui.showTitlebar, // purposely don't update this, because effects are only seen after restart
      showWizard: !settingsState.app.hasSeenAppWizard,
      showPlansInSidebar: userState.user.showPlansInSidebar,
      isWindowMaximized: process.platform !== 'darwin' ? remote.getCurrentWindow().isMaximized() : undefined
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      showWizard: !settingsState.app.hasSeenAppWizard
    })
  }

  userUpdated = (userState) => {
    this.setState({
      showPlansInSidebar: userState.user.showPlansInSidebar
    })
  }

  /* **************************************************************************/
  // Window Events
  /* **************************************************************************/

  handleWindowMaximize () {
    this.setState({ isWindowMaximized: true })
  }

  handleWindowUnmaximize () {
    this.setState({ isWindowMaximized: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showTitlebar, showWizard, showPlansInSidebar, isWindowMaximized } = this.state
    const { style, ...passProps } = this.props

    let extraItems = 0
    extraItems += showWizard ? 1 : 0
    extraItems += showPlansInSidebar ? 1 : 0

    const scrollerStyle = Object.assign({},
      styles.scroller,
      extraItems === 1 ? styles.scroller3Icons : undefined,
      extraItems === 2 ? styles.scroller4Icons : undefined,
      { top: showTitlebar ? 0 : 25 }
    )
    const footerStyle = Object.assign({},
      styles.footer,
      extraItems === 1 ? styles.footer3Icons : undefined,
      extraItems === 2 ? styles.footer4Icons : undefined
    )

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.container, style)}>
        {!showTitlebar && process.platform !== 'darwin' ? (
          <div style={styles.windowControls}>
            <IconButton
              onTouchTap={() => remote.getCurrentWindow().close()}
              style={styles.windowControlButton}
              hoveredStyle={styles.windowControlButtonHovered}
              iconStyle={styles.windowControlIcon}>
              <FontIcon className='fa fa-fw fa-window-close' color={Colors.blueGrey50} />
            </IconButton>
            {isWindowMaximized ? (
              <IconButton
                onTouchTap={() => remote.getCurrentWindow().unmaximize()}
                style={styles.windowControlButton}
                hoveredStyle={styles.windowControlButtonHovered}
                iconStyle={styles.windowControlIcon}>
                <FontIcon className='fa fa-fw fa-window-restore' color={Colors.blueGrey50} />
              </IconButton>
            ) : (
              <IconButton
                onTouchTap={() => remote.getCurrentWindow().maximize()}
                style={styles.windowControlButton}
                hoveredStyle={styles.windowControlButtonHovered}
                iconStyle={styles.windowControlIcon}>
                <FontIcon className='fa fa-fw fa-window-maximize' color={Colors.blueGrey50} />
              </IconButton>
            )}
            <IconButton
              onTouchTap={() => remote.getCurrentWindow().minimize()}
              style={styles.windowControlButton}
              hoveredStyle={styles.windowControlButtonHovered}
              iconStyle={styles.windowControlIcon}>
              <FontIcon className='fa fa-fw fa-window-minimize' color={Colors.blueGrey50} />
            </IconButton>
          </div>
        ) : undefined}
        <div
          style={scrollerStyle}
          className='ReactComponent-Sidelist-Scroller'>
          <SidelistMailboxes />
        </div>
        <div style={footerStyle}>
          {showWizard ? (<SidelistItemWizard />) : undefined}
          {showPlansInSidebar ? (<SidelistItemPro />) : undefined}
          <SidelistItemAddMailbox />
          <SidelistItemSettings />
        </div>
      </div>
    )
  }
}
