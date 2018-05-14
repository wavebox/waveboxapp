import React from 'react'
import PropTypes from 'prop-types'
import MailboxAvatar from 'Components/Mailbox/MailboxAvatar'
import { RaisedButton } from 'material-ui'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { settingsActions } from 'stores/settings'
import * as Colors from 'material-ui/styles/colors'

const styles = {
  // Layout
  container: {
    display: 'flex'
  },

  // Icon
  iconContainer: {
    width: 100,
    marginLeft: -12,
    textAlign: 'center',
    position: 'relative'
  },
  icon: {
    marginTop: 50
  },
  z1: {
    position: 'absolute',
    color: Colors.grey600,
    top: 30,
    right: 15
  },
  z2: {
    position: 'absolute',
    color: Colors.grey600,
    top: 20,
    right: 10
  },
  z3: {
    position: 'absolute',
    color: Colors.grey600,
    top: 10,
    right: 15
  },
  z4: {
    position: 'absolute',
    color: Colors.grey600,
    top: 0,
    right: 20
  },

  // Content
  content: {
    width: '100%'
  },
  title: {
    marginTop: 0,
    fontWeight: 'bold'
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: Colors.blue800
  },
  fullDisable: {
    fontSize: '85%',
    color: Colors.grey400
  },

  // Actions
  actionContainer: {
    marginTop: 8
  },
  button: {
    marginRight: 8
  }
}

export default class MailboxSleepNotification extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired,
    closeMetrics: PropTypes.object,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleDismiss = () => {
    const { mailbox, service, onRequestClose } = this.props
    mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setHasSeenSleepableWizard, true)
    onRequestClose()
  }

  handleDisableSleep = () => {
    const { mailbox, service, onRequestClose } = this.props
    mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepable, false)
    mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setHasSeenSleepableWizard, true)
    onRequestClose()
  }

  handleCustomize = () => {
    const { mailbox, service, onRequestClose } = this.props
    mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setHasSeenSleepableWizard, true)
    window.location.hash = `/settings/accounts/${mailbox.id}`
    onRequestClose()
  }

  handleFullDisable = () => {
    const { onRequestClose } = this.props
    onRequestClose()
    setTimeout(() => {
      settingsActions.sub.ui.setShowDefaultServiceSleepNotifications(false)
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailbox, service, closeMetrics } = this.props

    const displayNameText = mailbox.hasAdditionalServices ? (
      `${service.humanizedTypeShort} : ${mailbox.displayName}`
    ) : (
      mailbox.displayName
    )
    const savingText = closeMetrics ? (
      `saving ${Math.round((closeMetrics.memory.workingSetSize || 0) / 1024)}MB of memory`
    ) : (
      `to save some memory`
    )
    const additionalInfo = service.supportsSync ? (
      service.supportsSyncWhenSleeping ? (
        `You'll still receive notifications and updates when this account is asleep.`
      ) : (
        `You may not receive notifications or updates whilst this account is sleeping.`
      )
    ) : ''

    return (
      <div style={styles.container}>
        <div style={styles.iconContainer}>
          <span style={styles.z1}>z</span>
          <span style={styles.z2}>z</span>
          <span style={styles.z3}>z</span>
          <span style={styles.z4}>z</span>
          <MailboxAvatar mailboxId={mailbox.id} size={50} style={styles.icon} />
        </div>
        <div style={styles.content}>
          <p style={styles.title}>{`${displayNameText} has just been put to sleep, ${savingText}.`}</p>
          {additionalInfo ? (<p>{additionalInfo}</p>) : undefined}
          <p>
            You can <span onClick={this.handleCustomize} style={styles.link}>customize these settings</span> at anytime
          </p>
          <div style={styles.actionContainer}>
            <RaisedButton
              label='Okay'
              primary
              style={styles.button}
              onClick={this.handleDismiss} />
            <RaisedButton
              label='Keep Awake'
              style={styles.button}
              onClick={this.handleDisableSleep} />
          </div>
          <p style={styles.fullDisable}>
            Sleep notifications only appear once for each account, unless you <span onClick={this.handleFullDisable} style={styles.link}>disable them</span> completely
          </p>
        </div>
      </div>
    )
  }
}
