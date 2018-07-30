import { ipcRenderer } from 'electron'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Tab, Tabs, AppBar } from '@material-ui/core'
import SwipeableViews from 'react-swipeable-views'
import NotificationScene from 'Scenes/NotificationScene'
import UnreadScene from 'Scenes/UnreadScene'
import AppSceneToolbar from './AppSceneToolbar'
import AppSceneWindowTitlebar from './AppSceneWindowTitlebar'
import { WB_TRAY_WINDOWED_MODE_CHANGED, WB_HIDE_TRAY } from 'shared/ipcEvents'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import classNames from 'classnames'
import ErrorBoundary from 'wbui/ErrorBoundary'

const TAB_HEIGHT = 40
const TOOLBAR_HEIGHT = 40
const UNREAD_INDEX = 0
const NOTIF_INDEX = 1

const styles = {
  container: {
    position: 'fixed', // Normally absolute, but fixes a weird page jump when opening the notifications menu
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  bodyWithTitlebar: {
    top: AppSceneWindowTitlebar.preferredHeight
  },
  titlebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },

  // Tabs
  appBar: {
    height: TAB_HEIGHT,
    minHeight: TAB_HEIGHT,
    backgroundColor: lightBlue[600]
  },
  tabButton: {
    color: 'white',
    maxWidth: 'none',
    height: TAB_HEIGHT,
    minHeight: TAB_HEIGHT
  },
  tabInkBar: {
    backgroundColor: lightBlue[100]
  },

  // Tab content
  tabs: {
    position: 'absolute',
    top: TAB_HEIGHT,
    left: 0,
    right: 0,
    bottom: TOOLBAR_HEIGHT
  },
  tabContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  tab: {
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  },

  // Toolbar
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TOOLBAR_HEIGHT,
    minHeight: TOOLBAR_HEIGHT,
    backgroundColor: lightBlue[600]
  }
}

@withStyles(styles)
class AppScene extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.unreadRef = null
    this.notifRef = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.resetNavTOs = new Map()
    ipcRenderer.on(WB_TRAY_WINDOWED_MODE_CHANGED, this.handleWindowedModeChanged)
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount () {
    Array.from(this.resetNavTOs.values()).forEach((to) => {
      clearTimeout(to)
    })
    ipcRenderer.removeListener(WB_TRAY_WINDOWED_MODE_CHANGED, this.handleWindowedModeChanged)
    document.body.removeEventListener('keyup', this.handleKeyUp)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      tabIndex: UNREAD_INDEX,
      isWindowedMode: false
    }
  })()

  /* **************************************************************************/
  // Window events
  /* **************************************************************************/

  /**
  * Handles the window mode changing
  * @param evt: the event that fired
  * @param isWindowedMode: whether we're now in windowed mode or not
  */
  handleWindowedModeChanged = (evt, isWindowedMode) => {
    this.setState({ isWindowedMode: isWindowedMode })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Changes tab
  * @param evt: the event that fired
  * @param index: the new index
  */
  handleChangeTab = (evt, index) => {
    this.setState((prevState) => {
      const prevIndex = prevState.tabIndex
      if (prevIndex === index) {
        clearTimeout(this.resetNavTOs.get(index))
        this.resetNavTOs.delete(index)
        switch (index) {
          case UNREAD_INDEX: this.unreadRef.resetNavigationStack(); break
          case NOTIF_INDEX: this.notifRef.resetNavigationStack(); break
        }
        return undefined
      } else {
        if (this.resetNavTOs.has(index)) {
          clearTimeout(this.resetNavTOs.get(index))
          this.resetNavTOs.delete(index)
        }
        if (this.resetNavTOs.has(prevIndex)) {
          clearTimeout(this.resetNavTOs.get(prevIndex))
        }
        this.resetNavTOs.set(prevIndex, setTimeout(() => {
          switch (prevIndex) {
            case UNREAD_INDEX: this.unreadRef.resetNavigationStack(); break
            case NOTIF_INDEX: this.notifRef.resetNavigationStack(); break
          }
        }, 500))

        return { tabIndex: index }
      }
    })
  }

  /**
  * Listens on key-up commands to close the window
  * @param evt: the dom event that fired
  */
  handleKeyUp = (evt) => {
    if (evt.keyCode === 27 || evt.key === 'Escape') {
      if (!this.state.isWindowedMode) {
        ipcRenderer.send(WB_HIDE_TRAY, {})
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const {
      tabIndex,
      isWindowedMode
    } = this.state

    return (
      <div className={classes.container}>
        {isWindowedMode ? (
          <AppSceneWindowTitlebar className={classes.titlebar} />
        ) : undefined}
        <div className={classNames(classes.body, isWindowedMode ? classes.bodyWithTitlebar : undefined)}>
          <AppBar position='static' className={classes.appBar}>
            <Tabs
              fullWidth
              value={tabIndex}
              onChange={this.handleChangeTab}
              classes={{ indicator: classes.tabInkBar }}>
              <Tab
                label='Unread'
                className={classes.tabButton}
                value={UNREAD_INDEX} />
              <Tab
                label='Notifications'
                className={classes.tabButton}
                value={NOTIF_INDEX} />
            </Tabs>
          </AppBar>
          <ErrorBoundary>
            <SwipeableViews
              style={styles.tabs}
              containerStyle={styles.tabContainer}
              slideStyle={styles.tab}
              index={tabIndex}
              onChangeIndex={(index) => this.setState({ tabIndex: index })}>
              <UnreadScene innerRef={(n) => { this.unreadRef = n }} />
              <NotificationScene innerRef={(n) => { this.notifRef = n }} />
            </SwipeableViews>
          </ErrorBoundary>
          <AppSceneToolbar className={classes.toolbar} isWindowedMode={isWindowedMode} />
        </div>
      </div>
    )
  }
}

export default AppScene
