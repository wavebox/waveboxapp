import { ipcRenderer } from 'electron'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Tab, Tabs, AppBar } from '@material-ui/core'
import SwipeableViews from 'react-swipeable-views'
import NotificationScene from 'Scenes/NotificationScene'
import UnreadScene from 'Scenes/UnreadScene'
import RecentScene from 'Scenes/RecentScene'
import ReadingScene from 'Scenes/ReadingScene'
import DownloadScene from 'Scenes/DownloadScene'
import AppSceneToolbar from './AppSceneToolbar'
import AppSceneWindowTitlebar from './AppSceneWindowTitlebar'
import {
  WB_TRAY_WINDOWED_MODE_CHANGED,
  WB_TRAY_WINDOWED_ALWAYS_ON_TOP_CHANGED,
  WB_HIDE_TRAY
} from 'shared/ipcEvents'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import classNames from 'classnames'
import ErrorBoundary from 'wbui/ErrorBoundary'

const TAB_HEIGHT = 40
const TOOLBAR_HEIGHT = 40

const UNREAD_INDEX = 0
const NOTIF_INDEX = 1
const RECENT_INDEX = 2
const READING_INDEX = 3
const DOWNLOAD_INDEX = 4

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
    this.unreadRef = React.createRef()
    this.notifRef = React.createRef()
    this.recentRef = React.createRef()
    this.readingRef = React.createRef()
    this.downloadRef = React.createRef()
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.resetNavTOs = new Map()
    ipcRenderer.on(WB_TRAY_WINDOWED_MODE_CHANGED, this.handleWindowedModeChanged)
    ipcRenderer.on(WB_TRAY_WINDOWED_ALWAYS_ON_TOP_CHANGED, this.handleAlwaysOnTopChanged)
    document.body.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount () {
    Array.from(this.resetNavTOs.values()).forEach((to) => {
      clearTimeout(to)
    })
    ipcRenderer.removeListener(WB_TRAY_WINDOWED_MODE_CHANGED, this.handleWindowedModeChanged)
    ipcRenderer.removeListener(WB_TRAY_WINDOWED_ALWAYS_ON_TOP_CHANGED, this.handleAlwaysOnTopChanged)
    document.body.removeEventListener('keyup', this.handleKeyUp)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      tabIndex: UNREAD_INDEX,
      isWindowedMode: false,
      alwaysOnTop: false
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

  /**
  * Handles the always on top mode changing
  * @param evt: the event that fired
  * @param alwaysOnTop: whether we're now in windowed mode or not
  */
  handleAlwaysOnTopChanged = (evt, alwaysOnTop) => {
    this.setState({ alwaysOnTop: alwaysOnTop })
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
        try {
          switch (index) {
            case UNREAD_INDEX: this.unreadRef.current.resetNavigationStack(); break
            case NOTIF_INDEX: this.notifRef.current.resetNavigationStack(); break
            case RECENT_INDEX: this.recentRef.current.resetNavigationStack(); break
            case READING_INDEX: this.readingRef.current.resetNavigationStack(); break
            case DOWNLOAD_INDEX: this.downloadRef.current.resetNavigationStack(); break
          }
        } catch (ex) { }
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
          try {
            switch (prevIndex) {
              case UNREAD_INDEX: this.unreadRef.current.resetNavigationStack(); break
              case NOTIF_INDEX: this.notifRef.current.resetNavigationStack(); break
              case RECENT_INDEX: this.recentRef.current.resetNavigationStack(); break
              case READING_INDEX: this.readingRef.current.resetNavigationStack(); break
              case DOWNLOAD_INDEX: this.downloadRef.current.resetNavigationStack(); break
            }
          } catch (ex) { }
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
      isWindowedMode,
      alwaysOnTop
    } = this.state

    return (
      <div className={classes.container}>
        {isWindowedMode ? (
          <AppSceneWindowTitlebar className={classes.titlebar} />
        ) : undefined}
        <div className={classNames(classes.body, isWindowedMode ? classes.bodyWithTitlebar : undefined)}>
          <AppBar position='static' className={classes.appBar}>
            <Tabs
              variant='fullWidth'
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
              <Tab
                label='Recent'
                className={classes.tabButton}
                value={RECENT_INDEX} />
              <Tab
                label='Tasks'
                className={classes.tabButton}
                value={READING_INDEX} />
              <Tab
                label='Downloads'
                className={classes.tabButton}
                value={DOWNLOAD_INDEX} />
            </Tabs>
          </AppBar>
          <ErrorBoundary>
            <SwipeableViews
              style={styles.tabs}
              containerStyle={styles.tabContainer}
              slideStyle={styles.tab}
              index={tabIndex}
              onChangeIndex={(index) => this.setState({ tabIndex: index })}>
              <UnreadScene innerRef={this.unreadRef} />
              <NotificationScene innerRef={this.notifRef} />
              <RecentScene innerRef={this.recentRef} />
              <ReadingScene innerRef={this.readingRef} />
              <DownloadScene innerRef={this.downloadRef} />
            </SwipeableViews>
          </ErrorBoundary>
          <AppSceneToolbar
            className={classes.toolbar}
            isWindowedMode={isWindowedMode}
            alwaysOnTop={alwaysOnTop} />
        </div>
      </div>
    )
  }
}

export default AppScene
