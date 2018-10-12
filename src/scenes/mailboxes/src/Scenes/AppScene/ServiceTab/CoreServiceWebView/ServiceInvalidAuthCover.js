import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import ServiceInformationCover from '../ServiceInformationCover'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import FingerprintIcon from '@material-ui/icons/Fingerprint'

const styles = {
  infoButtonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class ServiceInvalidAuthCover extends React.Component {
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
    accountStore.listen(this.accountStoreUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountStoreUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState({
        serviceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(nextProps.serviceId),
        serviceAuthMissing: accountState.isMailboxAuthMissingForServiceId(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      serviceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(this.props.serviceId),
      serviceAuthMissing: accountState.isMailboxAuthMissingForServiceId(this.props.serviceId)
    }
  })()

  accountStoreUpdated = (accountState) => {
    this.setState({
      serviceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(this.props.serviceId),
      serviceAuthMissing: accountState.isMailboxAuthMissingForServiceId(this.props.serviceId)
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Reauthenticates the service
  * @param evt: the event that fired
  */
  handleReauthenticate = (evt) => {
    accountActions.reauthenticateService(this.props.serviceId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, serviceId, ...passProps } = this.props
    const { serviceAuthInvalid, serviceAuthMissing } = this.state

    if (serviceAuthMissing) {
      return (
        <ServiceInformationCover
          {...passProps}
          title='Sign in'
          IconComponent={FingerprintIcon}
          text={[
            `Wavebox doesn't have any authentication information for this service.`,
            `To start using it, you need to sign in`
          ]}
          button={(
            <Button
              variant='raised'
              onClick={this.handleReauthenticate}>
              <FingerprintIcon className={classes.infoButtonIcon} />
              Sign in
            </Button>
          )} />
      )
    } else if (serviceAuthInvalid) { // Invalid will also be true if missing, so capture missing first
      return (
        <ServiceInformationCover
          {...passProps}
          title='Sign back in'
          IconComponent={FingerprintIcon}
          text={[
            `There's an authentication problem with this service.`,
            `Wavebox either doesn't have any authentication information for this service or it's invalid.`
          ]}
          button={(
            <Button
              variant='raised'
              onClick={this.handleReauthenticate}>
              <FingerprintIcon className={classes.infoButtonIcon} />
              Reauthenticate
            </Button>
          )} />
      )
    } else {
      return false
    }
  }
}

export default ServiceInvalidAuthCover
