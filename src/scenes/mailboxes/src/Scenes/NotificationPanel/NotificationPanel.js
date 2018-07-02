import React from 'react'
import NotificationSystem from 'react-notification-system'
import { accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import { settingsStore } from 'stores/settings'
import MailboxSleepNotification from './MailboxSleepNotification'
import grey from '@material-ui/core/colors/grey'

const NOTIFICATION_STYLE = {
  NotificationItem: {
    DefaultStyle: {
      overflow: 'hidden'
    },
    info: {
      backgroundColor: grey[200],
      paddingTop: 18,
      paddingBottom: 18,
      paddingLeft: 12,
      paddingRight: 12,
      borderTop: 'none',
      boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px'
    }
  },
  Containers: {
    DefaultStyle: {
      width: 450
    }
  }
}

const REF = 'NOTIFICATION_SYSTEM'

class NotificationPanel extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this._active = new Set()
    this._checkSleepNotificationsThrottle = null

    accountStore.listen(this.accountsChanged)
    userStore.listen(this.userChanged)
    settingsStore.listen(this.settingsChanged)
    this.checkSleepNotifications()
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountsChanged)
    userStore.unlisten(this.userChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      showDefaultServiceSleepNotifications: this.shouldShowSleepNotifications(undefined, undefined)
    }
  })()

  userChanged = (userState) => {
    this.setState({
      showDefaultServiceSleepNotifications: this.shouldShowSleepNotifications(userState, undefined)
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      showDefaultServiceSleepNotifications: this.shouldShowSleepNotifications(undefined, settingsState)
    })
  }

  accountsChanged = (accountState) => {
    if (!this.refs[REF]) { return }
    clearTimeout(this._checkSleepNotificationsThrottle)
    this._checkSleepNotificationsThrottle = setTimeout(() => {
      this.checkSleepNotifications(accountState)
    }, 1000)
  }

  /**
  * @param userState=autoget: the current user state
  * @param settingsState=autoget: the current settings state
  * @return true if we should show sleep notifications, false otherwise
  */
  shouldShowSleepNotifications (userState = userStore.getState(), settingsState = settingsStore.getState()) {
    return userState.wireConfigExperiments().showDefaultServiceSleepNotifications === true &&
      settingsState.ui.showDefaultServiceSleepNotifications === true
  }

  /* **************************************************************************/
  // Mailbox notifications
  /* **************************************************************************/

  /**
  * Checks for sleeping notifications we should show
  * @param accountState=autoget: the current account state
  */
  checkSleepNotifications = (accountState = accountStore.getState()) => {
    if (!this.refs[REF]) { return }
    clearTimeout(this._checkSleepNotificationsThrottle)
    accountState
      .serviceIds()
      .map((serviceId) => accountState.getSleepingNotificationInfo(serviceId))
      .filter((info) => !!info)
      .forEach(({service, closeMetrics}) => {
        const notificationId = `mailbox:sleeping:${service.id}`
        if (this._active.has(notificationId)) { return }

        this.refs[REF].addNotification({
          uid: notificationId,
          level: 'info',
          children: (
            <MailboxSleepNotification
              mailboxId={service.parentId}
              serviceId={service.id}
              onRequestClose={() => this.refs[REF].removeNotification(notificationId)}
              closeMetrics={closeMetrics} />),
          message: '',
          autoDismiss: 0,
          dismissible: false,
          position: 'br',
          onAdd: this.handleAddNotification,
          onRemove: this.handleRemoveNotification
        })
      })
  }

  /* **************************************************************************/
  // Notification events
  /* **************************************************************************/

  /**
  * Handles a notification being added
  * @param notification: the notification thats been added
  */
  handleAddNotification = (notification) => {
    this._active.add(notification.uid)
  }

  /**
  * Handles a notification being removed
  * @param notification: the notification thats been added
  */
  handleRemoveNotification = (notification) => {
    this._active.delete(notification.uid)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { showDefaultServiceSleepNotifications } = this.state
    if (!showDefaultServiceSleepNotifications) { return false }

    return (<NotificationSystem ref={REF} style={NOTIFICATION_STYLE} />)
  }
}

export default NotificationPanel
