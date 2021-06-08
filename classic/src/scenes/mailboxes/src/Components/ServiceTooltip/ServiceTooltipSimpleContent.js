import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'

class ServiceTooltipContent extends React.Component {
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
      this.setState(this.generateServiceState(nextProps.serviceId))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateServiceState(this.props.serviceId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(this.generateServiceState(this.props.serviceId, accountState))
  }

  /**
  * @param serviceId: the id of the service
  * @param accountState=autoget: the current account state
  * @return state object
  */
  generateServiceState (serviceId, accountState = accountStore.getState()) {
    const mailbox = accountState.getMailboxForService(serviceId)
    const service = accountState.getService(serviceId)

    return mailbox && service ? {
      hasMembers: true,
      displayName: accountState.resolvedServiceDisplayName(
        serviceId,
        accountState.resolvedMailboxDisplayName(mailbox.id)
      ),
      humanizedServiceTypeShort: service.humanizedTypeShort,
      humanizedServiceType: service.humanizedType
    } : {
      hasMembers: false
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
      ...passProps
    } = this.props
    const {
      hasMembers,
      displayName,
      humanizedServiceTypeShort,
      humanizedServiceType
    } = this.state
    if (!hasMembers) { return false }

    return (
      <div {...passProps}>
        {displayName === humanizedServiceTypeShort || displayName === humanizedServiceType
          ? displayName
          : `${humanizedServiceTypeShort} : ${displayName}`}
      </div>
    )
  }
}

export default ServiceTooltipContent
