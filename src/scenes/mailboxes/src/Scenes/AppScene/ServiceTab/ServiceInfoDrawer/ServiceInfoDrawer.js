import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import ACCOUNT_WARNING_TYPES from 'shared/Models/ACAccounts/AccountWarningTypes'
import shallowCompare from 'react-addons-shallow-compare'
import { Slide } from '@material-ui/core'
import ServiceInfoPanel from 'wbui/ServiceInfoPanel'
import ServiceNamespaceClash from './ServiceNamespaceClash'
import ServiceInstallInfo from './ServiceInstallInfo'
import GoogleInboxRetirement from './GoogleInboxRetirement'
import GoogleInboxToGmailHelper from './GoogleInboxToGmailHelper'
import GoogleInboxService from 'shared/Models/ACAccounts/Google/GoogleInboxService'
import GoogleMailService from 'shared/Models/ACAccounts/Google/GoogleMailService'

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
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
    userStore.unlisten(this.userUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      const userState = userStore.getState()
      this.setState({
        ...this.deriveWarningsFromAccount(nextProps.serviceId, accountState),
        ...this.deriveServiceInfo(nextProps.serviceId, accountState),
        ...this.deriveShowGoogleInboxRetirementForService(nextProps.serviceId, accountState, userState),
        ...this.deriveShowGoogleInboxToGmailHelperForService(nextProps.serviceId, accountState)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    const userState = userStore.getState()
    return {
      ...this.deriveWarningsFromAccount(this.props.serviceId, accountState),
      ...this.deriveServiceInfo(this.props.serviceId, accountState),
      ...this.deriveShowGoogleInboxRetirementForService(this.props.serviceId, accountState, userState),
      ...this.deriveShowGoogleInboxToGmailHelperForService(this.props.serviceId, accountState)
    }
  })()

  accountUpdated = (accountState) => {
    const userState = userStore.getState()
    this.setState({
      ...this.deriveWarningsFromAccount(this.props.serviceId, accountState),
      ...this.deriveServiceInfo(this.props.serviceId, accountState),
      ...this.deriveShowGoogleInboxRetirementForService(this.props.serviceId, accountState, userState),
      ...this.deriveShowGoogleInboxToGmailHelperForService(this.props.serviceId, accountState)
    })
  }

  userUpdated = (userState) => {
    const accountState = accountStore.getState()
    this.setState({
      ...this.deriveShowGoogleInboxRetirementForService(this.props.serviceId, accountState, userState)
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

  /**
  * Checks to see if we should show the google inbox retirement info
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @param userState: the current user state
  * @return a state update object
  */
  deriveShowGoogleInboxRetirementForService (serviceId, accountState, userState) {
    const service = accountState.getService(serviceId)
    if (!service) { return }

    return {
      showGoogleInboxRetirement: (
        service.type === GoogleInboxService.type &&
        service.ginboxSeenRetirementVersion < userState.wireConfigGoogleInboxRetirementVersion()
      )
    }
  }

  /**
  * Checks to see if we should show the google inbox -> gmail helper info
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return a state update object
  */
  deriveShowGoogleInboxToGmailHelperForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    if (!service) { return }

    return {
      showGoogleInboxToGmailHelper: (
        service.type === GoogleMailService.type &&
        service.wasGoogleInboxService &&
        !service.hasSeenGoogleInboxToGmailHelper
      )
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
      showInstallInfo,
      showGoogleInboxRetirement,
      showGoogleInboxToGmailHelper
    } = this.state

    let content
    if (showInstallInfo) {
      content = (<ServiceInstallInfo serviceId={serviceId} />)
    } else if (hasNamespaceClashWarning) {
      content = (<ServiceNamespaceClash serviceId={serviceId} />)
    } else if (showGoogleInboxRetirement) {
      content = (<GoogleInboxRetirement serviceId={serviceId} />)
    } else if (showGoogleInboxToGmailHelper) {
      content = (<GoogleInboxToGmailHelper serviceId={serviceId} />)
    }

    return (
      <Slide
        direction='left'
        in={!!content}
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
