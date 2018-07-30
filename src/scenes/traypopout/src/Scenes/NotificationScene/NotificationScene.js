import React from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import { notifhistStore } from 'stores/notifhist'
import { accountActions } from 'stores/account'
import { emblinkActions } from 'stores/emblink'
import Infinate from 'react-infinite'
import { List } from '@material-ui/core'
import { ipcRenderer } from 'electron'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'
import NotificationListItem from './NotificationListItem'
import ErrorBoundary from 'wbui/ErrorBoundary'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'

const MAIN_REF = 'MAIN'
const INFINATE_REF = 'INFINATE'
const LIST_ITEM_HEIGHT = 67

const styles = {
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  list: {
    padding: 0
  },
  listItem: {
    height: LIST_ITEM_HEIGHT
  }
}

@withStyles(styles)
class NotificationScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    notifhistStore.listen(this.notificationsChanged)

    window.addEventListener('resize', this.saveContainerHeight, false)
    this.saveContainerHeight()
  }

  componentWillUnmount () {
    notifhistStore.unlisten(this.notificationsChanged)

    window.removeEventListener('resize', this.saveContainerHeight)
  }

  componentDidUpdate () {
    this.saveContainerHeight()
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      notifications: notifhistStore.getState().notifications,
      containerHeight: 0
    }
  })()

  notificationsChanged = (notificationState) => {
    this.setState({
      notifications: notificationState.notifications
    })
  }

  /* **************************************************************************/
  // UI Lifecycle
  /* **************************************************************************/

  saveContainerHeight = () => {
    const height = this.refs[MAIN_REF].clientHeight
    if (height !== this.state.containerHeight) { // Don't queue in a callback, this is good enough
      this.setState({ containerHeight: height })
    }
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * Resets the navigation stack
  */
  resetNavigationStack = () => {
    ReactDOM.findDOMNode(this.refs[INFINATE_REF]).scrollTop = 0
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the notification being clicked on
  * @param evt: the event that fired
  * @param notification: the notification object
  */
  handleNotificationClick = (evt, notification) => {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
    accountActions.changeActiveService(notification.serviceId)
    if (notification.openPayload) {
      // Not all notifications are openable at any time
      emblinkActions.openItem(notification.serviceId, notification.openPayload)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, classes, ...passProps } = this.props
    const { notifications, containerHeight } = this.state

    return (
      <div ref={MAIN_REF} className={classNames(className, classes.main)} {...passProps}>
        <ErrorBoundary>
          <List className={classes.list}>
            {containerHeight === 0 ? undefined : (
              <Infinate ref={INFINATE_REF} containerHeight={containerHeight} elementHeight={LIST_ITEM_HEIGHT}>
                {notifications.map(({id, timestamp, notification}) => {
                  return (
                    <NotificationListItem
                      key={id}
                      onClick={(evt) => this.handleNotificationClick(evt, notification)}
                      className={classes.listItem}
                      mailboxId={notification.mailboxId}
                      notification={notification}
                      timestamp={timestamp} />
                  )
                })}
              </Infinate>
            )}
          </List>
        </ErrorBoundary>
      </div>
    )
  }
}

export default NotificationScene
