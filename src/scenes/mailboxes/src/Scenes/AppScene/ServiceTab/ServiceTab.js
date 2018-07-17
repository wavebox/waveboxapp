import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import GoogleMailServiceWebView from './Google/GoogleMailServiceWebView'
import GoogleHangoutsServiceWebView from './Google/GoogleHangoutsServiceWebView'
import GoogleCalendarServiceWebView from './Google/GoogleCalendarServiceWebView'
import GoogleAlloServiceWebView from './Google/GoogleAlloServiceWebView'
import TrelloServiceWebView from './Trello/TrelloServiceWebView'
import SlackServiceWebView from './Slack/SlackServiceWebView'
import GenericServiceWebView from './Generic/GenericServiceWebView'
import ContainerServiceWebView from './Container/ContainerServiceWebView'
import MicrosoftMailServiceWebView from './Microsoft/MicrosoftMailServiceWebView'
import CoreServiceWebViewHibernator from './CoreServiceWebViewHibernator'
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
        mailboxId: service.parentId
      } : {
        hasService: false,
        serviceType: undefined,
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
  * @return the class
  */
  getWebviewClass (serviceType) {
    switch (serviceType) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
        return GoogleMailServiceWebView
      case SERVICE_TYPES.GOOGLE_HANGOUTS:
        return GoogleHangoutsServiceWebView
      case SERVICE_TYPES.GOOGLE_CALENDAR:
        return GoogleCalendarServiceWebView
      case SERVICE_TYPES.GOOGLE_ALLO:
        return GoogleAlloServiceWebView
      case SERVICE_TYPES.TRELLO:
        return TrelloServiceWebView
      case SERVICE_TYPES.SLACK:
        return SlackServiceWebView
      case SERVICE_TYPES.GENERIC:
        return GenericServiceWebView
      case SERVICE_TYPES.CONTAINER:
        return ContainerServiceWebView
      case SERVICE_TYPES.MICROSOFT_MAIL:
        return MicrosoftMailServiceWebView
      default:
        return CoreServiceWebViewHibernator
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
      isActive,
      hasService,
      mailboxId,
      isRestricted
    } = this.state
    if (!hasService) { return false }

    const WebviewClass = this.getWebviewClass(serviceType)
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
