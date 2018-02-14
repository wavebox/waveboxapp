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
    backgroundColor: Colors.blue600
  }
}

export default class AppScene extends React.Component {
  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      tabIndex: 0
    }
  })()

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
          onChange={(index) => this.setState({ tabIndex: index })}>
          <Tab
            label='Unread'
            buttonStyle={styles.tabButton}
            value={0} />
          <Tab
            label='Notifications'
            buttonStyle={styles.tabButton}
            value={1} />
        </Tabs>
        <SwipeableViews
          style={styles.tabs}
          containerStyle={styles.tabContainer}
          slideStyle={styles.tab}
          index={tabIndex}
          onChangeIndex={(index) => this.setState({ tabIndex: index })}>
          <UnreadScene />
          <NotificationScene />
        </SwipeableViews>
        <Toolbar style={styles.toolbar}>
          <ToolbarGroup firstChild>
            <IconButton
              tooltip='Compose'
              onClick={() => { emblinkActions.composeNewMessage() }}
              tooltipPosition='top-right'>
              <FontIcon className='material-icons' color={Colors.blue50}>create</FontIcon>
            </IconButton>
            <IconButton
              tooltip='Show main window'
              onClick={() => { ipcRenderer.send(WB_FOCUS_APP, {}) }}
              tooltipPosition='top-center'>
              <FontIcon className='material-icons' color={Colors.blue50}>launch</FontIcon>
            </IconButton>
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <IconButton
              tooltip='Quit Wavebox'
              onClick={() => { ipcRenderer.send(WB_QUIT_APP, {}) }}
              tooltipPosition='top-left'>
              <FontIcon className='material-icons' color={Colors.blue50}>close</FontIcon>
            </IconButton>
          </ToolbarGroup>
        </Toolbar>
      </div>
    )
  }
}
