import React from 'react'
import PropTypes from 'prop-types'
import MailboxAvatar from 'wbui/MailboxAvatar'
import { Button } from '@material-ui/core'
import { accountStore, accountActions } from 'stores/account'
import { settingsActions } from 'stores/settings'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import blue from '@material-ui/core/colors/blue'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import shallowCompare from 'react-addons-shallow-compare'
import Resolver from 'Runtime/Resolver'

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
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired,
    closeMetrics: PropTypes.object,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState({
        mailbox: accountState.getMailbox(nextProps.mailboxId),
        service: accountState.getService(nextProps.serviceId),
        serviceDisplayName: accountState.resolvedServiceDisplayName(nextProps.serviceId),
        avatar: accountState.getMailboxAvatarConfig(nextProps.mailboxId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      mailbox: accountState.getMailbox(this.props.mailboxId),
      service: accountState.getService(this.props.serviceId),
      serviceDisplayName: accountState.resolvedServiceDisplayName(this.props.serviceId),
      avatar: accountState.getMailboxAvatarConfig(this.props.mailboxId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      mailbox: accountState.getMailbox(this.props.mailboxId),
      service: accountState.getService(this.props.serviceId),
      serviceDisplayName: accountState.resolvedServiceDisplayName(this.props.serviceId),
      avatar: accountState.getMailboxAvatarConfig(this.props.mailboxId)
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleDismiss = () => {
    const { serviceId, onRequestClose } = this.props
    accountActions.reduceService(serviceId, ServiceReducer.setHasSeenSleepableWizard, true)
    onRequestClose()
  }

  handleDisableSleep = () => {
    const { serviceId, onRequestClose } = this.props
    accountActions.reduceService(serviceId, ServiceReducer.setSleepable, false)
    accountActions.reduceService(serviceId, ServiceReducer.setHasSeenSleepableWizard, true)
    onRequestClose()
  }

  handleCustomize = () => {
    const { mailboxId, serviceId, onRequestClose } = this.props
    accountActions.reduceService(serviceId, ServiceReducer.setHasSeenSleepableWizard, true)
    window.location.hash = `/settings/accounts/${mailboxId}`
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

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { closeMetrics, classes } = this.props
    const { mailbox, service, serviceDisplayName, avatar } = this.state

    const displayNameText = `${serviceDisplayName || mailbox.displayName} (${service.humanizedType})`
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
          <MailboxAvatar
            avatar={avatar}
            resolver={(i) => Resolver.Image(i)}
            size={50}
            className={classes.icon} />
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
