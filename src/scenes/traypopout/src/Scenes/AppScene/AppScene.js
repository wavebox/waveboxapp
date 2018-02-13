import './AppScene.less'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Tab, Tabs} from 'material-ui'
import SwipeableViews from 'react-swipeable-views'
import NotificationScene from 'Scenes/NotificationScene'
import UnreadScene from 'Scenes/UnreadScene'
import * as Colors from 'material-ui/styles/colors'

const TAB_HEIGHT = 40
const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  tabContainer: {
    position: 'absolute',
    top: TAB_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0
  },
  inkBar: {
    backgroundColor: Colors.lightBlue100
  },
  tabItemContainer: {
    height: TAB_HEIGHT
  },
  tabButton: {
    height: TAB_HEIGHT,
    textTransform: 'none'
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

    //TODO compose, hide/show, quit
    return (
      <div style={styles.content}>
        <Tabs
          value={tabIndex}
          inkBarStyle={styles.inkBar}
          tabItemContainerStyle={styles.tabItemContainer}
          tabTemplateStyle={{backgroundColor:'red'}}
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
          style={styles.tabContainer}
          className='ReactComponent-AppScene-Tab-Scrollbars'
          index={tabIndex}
          onChangeIndex={(index) => this.setState({ tabIndex: index })}>
          <UnreadScene />
          <NotificationScene />
        </SwipeableViews>
      </div>
    )
  }
}
