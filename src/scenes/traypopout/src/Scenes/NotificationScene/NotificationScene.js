import React from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import { localHistoryStore, localHistoryActions } from 'stores/localHistory'
import { accountActions } from 'stores/account'
import { emblinkActions } from 'stores/emblink'
import Infinate from 'react-infinite'
import { List, ListItemText, Menu, MenuItem } from '@material-ui/core'
import { ipcRenderer } from 'electron'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'
import NotificationListItem from './NotificationListItem'
import ErrorBoundary from 'wbui/ErrorBoundary'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'

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
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rootRef = React.createRef()
    this.listRef = React.createRef()
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    localHistoryStore.listen(this.notificationsChanged)

    window.addEventListener('resize', this.saveContainerHeight, false)
    this.saveContainerHeight()
  }

  componentWillUnmount () {
    localHistoryStore.unlisten(this.notificationsChanged)

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
      notifications: localHistoryStore.getState().notifications,
      containerHeight: 0,
      contextMenuAnchor: null
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
    if (this.rootRef.current) {
      const height = this.rootRef.current.clientHeight
      if (height !== this.state.containerHeight) { // Don't queue in a callback, this is good enough
        this.setState({ containerHeight: height })
      }
    }
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * Resets the navigation stack
  */
  resetNavigationStack = () => {
    if (this.listRef.current) {
      ReactDOM.findDOMNode(this.listRef.current).scrollTop = 0
    }
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

  /**
  * Handles opening the context menu
  * @param evt: the event that fired
  */
  handleOpenContextMenu = (evt) => {
    this.setState({
      contextMenuAnchor: {
        anchor: evt.target,
        anchorPosition: { top: evt.clientY, left: evt.clientX }
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      className,
      classes,
      ...passProps
    } = this.props
    const {
      notifications,
      containerHeight,
      contextMenuAnchor
    } = this.state

    return (
      <div ref={this.rootRef} className={classNames(className, classes.main)} {...passProps}>
        <ErrorBoundary>
          <React.Fragment>
            <List
              className={classes.list}
              onContextMenu={this.handleOpenContextMenu}>
              {containerHeight === 0 ? undefined : (
                <Infinate ref={this.listRef} containerHeight={containerHeight} elementHeight={LIST_ITEM_HEIGHT}>
                  {notifications.map(({ id, timestamp, notification }) => {
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
            <Menu
              {...(notifications.length !== 0 && contextMenuAnchor ? {
                open: true,
                anchorEl: contextMenuAnchor.anchor,
                anchorPosition: contextMenuAnchor.anchorPosition
              } : {
                open: false
              })}
              MenuListProps={{ dense: true }}
              anchorReference='anchorPosition'
              disableEnforceFocus
              disableAutoFocusItem
              onClose={() => this.setState({ contextMenuAnchor: null })}>
              <MenuItem onClick={() => {
                this.setState({ contextMenuAnchor: null })
                localHistoryActions.clearAllNotifications()
              }}>
                <ListItemText primary='Clear all Notifications' />
              </MenuItem>
            </Menu>
          </React.Fragment>
        </ErrorBoundary>
      </div>
    )
  }
}

export default NotificationScene
