import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import GoogleHangoutsServiceWebView from './ServiceWebViews/Google/GoogleHangoutsServiceWebView'
import GoogleCalendarServiceWebView from './ServiceWebViews/Google/GoogleCalendarServiceWebView'
import GoogleAlloServiceWebView from './ServiceWebViews/Google/GoogleAlloServiceWebView'
import SlackServiceWebView from './ServiceWebViews/Slack/SlackServiceWebView'
import GenericServiceWebView from './ServiceWebViews/Generic/GenericServiceWebView'
import ContainerServiceWebView from './ServiceWebViews/Container/ContainerServiceWebView'
import MicrosoftMailServiceWebView from './ServiceWebViews/Microsoft/MicrosoftMailServiceWebView'
import { IENGINE_ALIASES } from 'shared/IEngine/IEngineTypes'
import IEngineWebView from './ServiceWebViews/IEngineWebView'
import CoreServiceWebView from './CoreServiceWebView'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import RestrictedService from './RestrictedService'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceErrorBoundary from './ServiceErrorBoundary'
import ServiceInfoDrawer from './ServiceInfoDrawer'

const styles = {
  serviceTab: {
    position: 'absolute',
    top: 10000,
    bottom: -10000,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',

    '&.active': {
      top: 0,
      bottom: 0
    }
  }
}

@withStyles(styles)
class ServiceTab extends React.Component {
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
      this.setState(this.generateState(nextProps.serviceId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateState(this.props.serviceId, accountStore.getState())
    }
  })()

  /**
  * Generates the state from the given props
  * @param serviceId: the service id
  * @param accountState: the current account state
  * @return state object
  */
  generateState (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return {
      isActive: accountState.activeServiceId() === serviceId,
      isRestricted: accountState.isServiceRestricted(serviceId),
      ...service ? {
        hasService: true,
        serviceType: service.type,
        iengineAlias: service.iengineAlias,
        mailboxId: service.parentId
      } : {
        hasService: false,
        serviceType: undefined,
        iengineAlias: undefined,
        mailboxId: undefined
      }
    }
  }

  accountUpdated = (accountState) => {
    this.setState(this.generateState(this.props.serviceId, accountState))
  }

  userUpdated = (userState) => {
    const { serviceId } = this.props
    const accountState = accountStore.getState()
    this.setState({
      isRestricted: accountState.isServiceRestricted(serviceId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Gets the class for the mailbox
  * @param serviceType: the service of the tab
  * @param iengineAlias: the id of the iengine to use
  * @return the class
  */
  getWebviewClass (serviceType, iengineAlias) {
    if (IENGINE_ALIASES.has(iengineAlias)) {
      return IEngineWebView
    }
    switch (serviceType) {
      case SERVICE_TYPES.GOOGLE_HANGOUTS:
        return GoogleHangoutsServiceWebView
      case SERVICE_TYPES.GOOGLE_CALENDAR:
        return GoogleCalendarServiceWebView
      case SERVICE_TYPES.GOOGLE_ALLO:
        return GoogleAlloServiceWebView
      case SERVICE_TYPES.SLACK:
        return SlackServiceWebView
      case SERVICE_TYPES.GENERIC:
        return GenericServiceWebView
      case SERVICE_TYPES.CONTAINER:
        return ContainerServiceWebView
      case SERVICE_TYPES.MICROSOFT_MAIL:
        return MicrosoftMailServiceWebView
      default:
        return CoreServiceWebView
    }
  }

  render () {
    const {
      serviceId,
      className,
      classes,
      ...passProps
    } = this.props
    const {
      serviceType,
      iengineAlias,
      isActive,
      hasService,
      mailboxId,
      isRestricted
    } = this.state
    if (!hasService) { return false }

    const WebviewClass = this.getWebviewClass(serviceType, iengineAlias)
    return (
      <div className={classNames(classes.serviceTab, isActive ? 'active' : undefined, className)} {...passProps}>
        {isRestricted ? (
          <RestrictedService mailboxId={mailboxId} serviceId={serviceId} />
        ) : (
          <ServiceErrorBoundary>
            <div>
              <WebviewClass mailboxId={mailboxId} serviceId={serviceId} />
              <ServiceInfoDrawer serviceId={serviceId} />
            </div>
          </ServiceErrorBoundary>
        )}
      </div>
    )
  }
}

export default ServiceTab
