import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import ACCOUNT_WARNING_TYPES from 'shared/Models/ACAccounts/AccountWarningTypes'
import shallowCompare from 'react-addons-shallow-compare'
import { Slide } from '@material-ui/core'
import ServiceInfoPanel from 'wbui/ServiceInfoPanel'
import ServiceNamespaceClash from './ServiceNamespaceClash'
import ServiceInstallInfo from './ServiceInstallInfo'

class ServiceInfoDrawer extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState({
        ...this.deriveWarningsFromAccount(nextProps.serviceId, accountStore.getState()),
        ...this.deriveServiceInfo(nextProps.serviceId, accountStore.getState())
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveWarningsFromAccount(this.props.serviceId, accountStore.getState()),
      ...this.deriveServiceInfo(this.props.serviceId, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState({
      ...this.deriveWarningsFromAccount(this.props.serviceId, accountState),
      ...this.deriveServiceInfo(this.props.serviceId, accountState)
    })
  }

  /**
  * Gets the service info from the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return a state update object
  */
  deriveServiceInfo (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return {
      showInstallInfo: service
        ? service.hasInstallText && !service.hasSeenInstallInfo
        : false
    }
  }

  /**
  * Gets the warnings from the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return a state update object
  */
  deriveWarningsFromAccount (serviceId, accountState) {
    const warnings = {
      hasNamespaceClashWarning: !!accountState.getWarningForServiceAndType(
        serviceId,
        ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH
      )
    }
    const hasWarnings = !!Object.keys(warnings).find((k) => warnings[k])

    return {
      ...warnings,
      hasWarnings: hasWarnings
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
      className,
      ...passProps
    } = this.props
    const {
      hasNamespaceClashWarning,
      hasWarnings,
      showInstallInfo
    } = this.state
    const showPanel = hasWarnings || showInstallInfo

    let content
    if (showInstallInfo) {
      content = (<ServiceInstallInfo serviceId={serviceId} />)
    } else if (hasNamespaceClashWarning) {
      content = (<ServiceNamespaceClash serviceId={serviceId} />)
    }

    return (
      <Slide
        direction='left'
        in={showPanel}
        mountOnEnter
        unmountOnExit>
        <ServiceInfoPanel {...passProps}>
          {content}
        </ServiceInfoPanel>
      </Slide>
    )
  }
}

export default ServiceInfoDrawer
