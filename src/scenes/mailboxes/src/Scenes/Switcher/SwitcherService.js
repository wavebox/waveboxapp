import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { accountStore } from 'stores/account'
import ACAvatarCircle from 'wbui/ACAvatarCircle'
import classNames from 'classnames'
import Resolver from 'Runtime/Resolver'

const styles = {
  root: {
    display: 'inline-block'
  }
}

@withStyles(styles)
class SwitcherService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
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
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.deriveAccountState(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveAccountState(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.deriveAccountState(this.props.serviceId, accountState))
  }

  /**
  * Generates the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return the changeset
  */
  deriveAccountState (serviceId, accountState) {
    const mailbox = accountState.getMailboxForService(serviceId)
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    return mailbox && service && serviceData ? {
      membersAvailable: true,
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(mailbox.id)
      ),
      mailboxAvatar: accountState.getMailboxAvatarConfig(mailbox.id),
      serviceAvatar: accountState.getServiceAvatarConfig(serviceId),
      isServiceSleeping: accountState.isServiceSleeping(serviceId),
      isServiceRestricted: accountState.isServiceRestricted(serviceId)
    } : {
      membersAvailable: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      membersAvailable,
      displayName,
      isServiceSleeping,
      isServiceRestricted,
      mailboxAvatar,
      serviceAvatar
    } = this.state
    if (!membersAvailable) { return false }

    return (
      <div className={classNames(className, classes.root)} {...passProps}>
        <ACAvatarCircle
          avatar={mailboxAvatar}
          size={32}
          resolver={(i) => Resolver.image(i)}
          showSleeping={isServiceSleeping} />
        <ACAvatarCircle
          avatar={serviceAvatar}
          size={128}
          resolver={(i) => Resolver.image(i)}
          showSleeping={isServiceSleeping} />
        {displayName}
      </div>
    )
  }
}

export default SwitcherService
