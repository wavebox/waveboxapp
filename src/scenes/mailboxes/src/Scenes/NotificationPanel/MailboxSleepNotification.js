import React from 'react'
import PropTypes from 'prop-types'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import { Button } from 'material-ui'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import { settingsActions } from 'stores/settings'
import { withStyles } from 'material-ui/styles'
import grey from 'material-ui/colors/grey'
import blue from 'material-ui/colors/blue'

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
    marginTop: 50,
    display: 'inline-block'
  },
  z1: {
    position: 'absolute',
    color: grey[600],
    top: 30,
    right: 15
  },
  z2: {
    position: 'absolute',
    color: grey[600],
    top: 20,
    right: 10
  },
  z3: {
    position: 'absolute',
    color: grey[600],
    top: 10,
    right: 15
  },
  z4: {
    position: 'absolute',
    color: grey[600],
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
    color: blue[800]
  },
  fullDisable: {
    fontSize: '85%',
    color: grey[400]
  },

  // Actions
  actionContainer: {
    marginTop: 8
  },
  button: {
    marginRight: 8
  }
}

@withStyles(styles)
class MailboxSleepNotification extends React.Component {
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
    const { mailbox, service, closeMetrics, classes } = this.props

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
      <div className={classes.container}>
        <div className={classes.iconContainer}>
          <span className={classes.z1}>z</span>
          <span className={classes.z2}>z</span>
          <span className={classes.z3}>z</span>
          <span className={classes.z4}>z</span>
          <MailboxAvatar mailboxId={mailbox.id} size={50} className={classes.icon} />
        </div>
        <div className={classes.content}>
          <p className={classes.title}>{`${displayNameText} has just been put to sleep, ${savingText}.`}</p>
          {additionalInfo ? (<p>{additionalInfo}</p>) : undefined}
          <p>
            You can <span onClick={this.handleCustomize} className={classes.link}>customize these settings</span> at anytime
          </p>
          <div className={classes.actionContainer}>
            <Button variant='raised' color='primary' className={classes.button} onClick={this.handleDismiss}>
              Okay
            </Button>
            <Button variant='raised' className={classes.button} onClick={this.handleDisableSleep}>
              Keep Awake
            </Button>
          </div>
          <p className={classes.fullDisable}>
            Sleep notifications only appear once for each account, unless you <span onClick={this.handleFullDisable} className={classes.link}>disable them</span> completely
          </p>
        </div>
      </div>
    )
  }
}

export default MailboxSleepNotification
