import React from 'react'
import NotificationSystem from 'react-notification-system'
import {mailboxStore} from 'stores/mailbox'
import {userStore} from 'stores/user'
import CoreService from 'shared/Models/Accounts/CoreService'
import MailboxSleepNotification from './MailboxSleepNotification'
import * as Colors from 'material-ui/styles/colors'

const NOTIFICATION_STYLE = {
  NotificationItem: {
    DefaultStyle: {
      overflow: 'hidden'
    },
    info: {
      backgroundColor: Colors.grey200,
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

export default class NotificationPanel extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this._active = new Set()
    this._checkSleepNotificationsThrottle = null

    mailboxStore.listen(this.checkSleepNotifications)
    userStore.listen(this.userChanged)
    this.checkSleepNotifications()
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.checkSleepNotifications)
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      showDefaultServiceSleepNotifications: userStore.getState().wireConfigExperiments().showDefaultServiceSleepNotifications === true
    }
  })()

  userChanged = (userState) => {
    this.setState({
      showDefaultServiceSleepNotifications: userState.wireConfigExperiments().showDefaultServiceSleepNotifications === true
    })
  }

  mailboxesChanged = (mailboxState) => {
    clearTimeout(this._checkSleepNotificationsThrottle)
    this._checkSleepNotificationsThrottle = setTimeout(() => {
      this.checkSleepNotifications(mailboxState)
    }, 1000)
  }

  /* **************************************************************************/
  // Mailbox notifications
  /* **************************************************************************/

  /**
  * Checks for sleeping notifications we should show
  */
  checkSleepNotifications = () => {
    clearTimeout(this._checkSleepNotificationsThrottle)
    const mailboxState = mailboxStore.getState()
    mailboxState
      .mailboxIds()
      .map((mailboxId) => mailboxState.getSleepingNotificationInfo(mailboxId, CoreService.SERVICE_TYPES.DEFAULT))
      .filter((info) => !!info)
      .forEach(({mailbox, service, closeMetrics}) => {
        const notificationId = `mailbox:sleeping:${mailbox.id}:${CoreService.SERVICE_TYPES.DEFAULT}`
        if (this._active.has(notificationId)) { return }

        this.refs[REF].addNotification({
          uid: notificationId,
          level: 'info',
          children: (
            <MailboxSleepNotification
              mailbox={mailbox}
              service={service}
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
