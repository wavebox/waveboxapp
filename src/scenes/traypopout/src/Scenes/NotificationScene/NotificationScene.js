import React from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import { notifhistStore } from 'stores/notifhist'
import { mailboxActions } from 'stores/mailbox'
import { emblinkActions } from 'stores/emblink'
import Infinate from 'react-infinite'
import { List, ListItem } from 'material-ui'
import MailboxAvatar from 'Components/Mailbox/MailboxAvatar'
import TimeAgo from 'react-timeago'
import { ipcRenderer } from 'electron'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'

const MAIN_REF = 'MAIN'
const INFINATE_REF = 'INFINATE'
const LIST_ITEM_HEIGHT = 67

const styles = {
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  list: {
    padding: 0
  },

  // List Item
  listItem: {
    height: LIST_ITEM_HEIGHT,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottom: '1px solid rgb(224, 224, 224)'
  },
  listItemInner: {
    paddingTop: 8,
    paddingBottom: 8
  },
  listItemPrimaryText: {
    fontSize: 14,
    lineHeight: '16px',
    height: 16,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  listItemSecondaryText: {
    height: 'auto'
  },
  listItemNotificationBody: {
    fontSize: 13,
    lineHeight: '15px',
    height: 15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  listItemTimeago: {
    fontSize: 11
  },
  listItemIcon: {
    height: 40,
    width: 40,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
}

export default class UnreadScene extends React.Component {
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
    mailboxActions.changeActive(notification.mailboxId, notification.serviceType)
    if (notification.openPayload) {
      // Not all notifications are openable at any time
      emblinkActions.openItem(notification.mailboxId, notification.serviceType, notification.openPayload)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { style, ...passProps } = this.props
    const { notifications, containerHeight } = this.state

    return (
      <div
        ref={MAIN_REF}
        style={{...styles.main, ...style}}
        {...passProps}>
        <List style={styles.list}>
          {containerHeight === 0 ? undefined : (
            <Infinate ref={INFINATE_REF} containerHeight={containerHeight} elementHeight={LIST_ITEM_HEIGHT}>
              {notifications.map(({id, timestamp, notification}) => {
                return (
                  <ListItem
                    key={id}
                    onClick={(evt) => this.handleNotificationClick(evt, notification)}
                    style={styles.listItem}
                    innerDivStyle={{
                      ...styles.listItemInner,
                      ...(notification.icon ? { paddingRight: 72 } : undefined)
                    }}
                    leftAvatar={<MailboxAvatar mailboxId={notification.mailboxId} />}
                    rightAvatar={notification.icon ? (
                      <div style={{...styles.listItemIcon, backgroundImage: `url("${notification.icon}")`}} />
                    ) : undefined}
                    primaryText={(
                      <div style={styles.listItemPrimaryText}>{notification.title}</div>
                    )}
                    secondaryText={(
                      <div style={styles.listItemSecondaryText}>
                        <div style={styles.listItemNotificationBody}>{notification.body || ''}</div>
                        <div style={styles.listItemTimeago}>
                          <TimeAgo date={timestamp} />
                        </div>
                      </div>
                    )} />
                )
              })}
            </Infinate>
          )}
        </List>
      </div>
    )
  }
}
