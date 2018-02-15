import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Tab, Tabs, Toolbar, ToolbarGroup, IconButton, FontIcon } from 'material-ui'
import SwipeableViews from 'react-swipeable-views'
import NotificationScene from 'Scenes/NotificationScene'
import UnreadScene from 'Scenes/UnreadScene'
import * as Colors from 'material-ui/styles/colors'
import { ipcRenderer } from 'electron'
import { emblinkActions } from 'stores/emblink'
import {
  WB_FOCUS_APP,
  WB_QUIT_APP
} from 'shared/ipcEvents'

const TAB_HEIGHT = 40
const TOOLBAR_HEIGHT = 40
const UNREAD_INDEX = 0
const NOTIF_INDEX = 1
const UNREAD_REF = 'UNREAD'
const NOTIF_REF = 'NOTIF'

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  // Tabs
  inkBar: {
    backgroundColor: Colors.lightBlue100
  },
  tabItemContainer: {
    height: TAB_HEIGHT
  },
  tabButton: {
    height: TAB_HEIGHT,
    textTransform: 'none'
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
    backgroundColor: Colors.lightBlue600
  }
}

export default class AppScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.resetNavTOs = new Map()
  }

  componentWillUnmount () {
    Array.from(this.resetNavTOs.values()).forEach((to) => {
      clearTimeout(to)
    })
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      tabIndex: UNREAD_INDEX
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Changes tab
  * @param index: the new index
  */
  handleChangeTab = (index) => {
    this.setState((prevState) => {
      const prevIndex = prevState.tabIndex
      if (prevIndex === index) { return undefined }

      if (this.resetNavTOs.has(index)) {
        clearTimeout(this.resetNavTOs.get(index))
        this.resetNavTOs.delete(index)
      }
      if (this.resetNavTOs.has(prevIndex)) {
        clearTimeout(this.resetNavTOs.get(prevIndex))
      }
      this.resetNavTOs.set(prevIndex, setTimeout(() => {
        switch (prevIndex) {
          case UNREAD_INDEX: this.refs[UNREAD_REF].resetNavigationStack(); break
          case NOTIF_INDEX: this.refs[NOTIF_REF].resetNavigationStack(); break
        }
      }, 500))

      return { tabIndex: index }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { tabIndex } = this.state

    return (
      <div style={styles.content}>
        <Tabs
          value={tabIndex}
          inkBarStyle={styles.inkBar}
          tabItemContainerStyle={styles.tabItemContainer}
          onChange={this.handleChangeTab}>
          <Tab
            label='Unread'
            buttonStyle={styles.tabButton}
            value={UNREAD_INDEX} />
          <Tab
            label='Notifications'
            buttonStyle={styles.tabButton}
            value={NOTIF_INDEX} />
        </Tabs>
        <SwipeableViews
          style={styles.tabs}
          containerStyle={styles.tabContainer}
          slideStyle={styles.tab}
          index={tabIndex}
          onChangeIndex={(index) => this.setState({ tabIndex: index })}>
          <UnreadScene ref={UNREAD_REF} />
          <NotificationScene ref={NOTIF_REF} />
        </SwipeableViews>
        <Toolbar style={styles.toolbar}>
          <ToolbarGroup firstChild>
            <IconButton
              tooltip='Compose'
              onClick={() => { emblinkActions.composeNewMessage() }}
              tooltipPosition='top-right'>
              <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>create</FontIcon>
            </IconButton>
            <IconButton
              tooltip='Show main window'
              onClick={() => { ipcRenderer.send(WB_FOCUS_APP, {}) }}
              tooltipPosition='top-center'>
              <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>launch</FontIcon>
            </IconButton>
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <IconButton
              tooltip='Quit Wavebox'
              onClick={() => { ipcRenderer.send(WB_QUIT_APP, {}) }}
              tooltipPosition='top-left'>
              <FontIcon className='material-icons' color='rgba(255, 255, 255, 0.7)'>close</FontIcon>
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </div>
    )
  }
}
