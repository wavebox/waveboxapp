import PropTypes from 'prop-types'
import React from 'react'
import { accountStore } from 'stores/account'
import { userStore } from 'stores/user'
import GoogleMailServiceWebView from './MailboxWebView/Google/GoogleMailServiceWebView'
import GoogleHangoutsServiceWebView from './MailboxWebView/Google/GoogleHangoutsServiceWebView'
import GoogleCalendarServiceWebView from './MailboxWebView/Google/GoogleCalendarServiceWebView'
import GoogleAlloServiceWebView from './MailboxWebView/Google/GoogleAlloServiceWebView'
import TrelloServiceWebView from './MailboxWebView/Trello/TrelloServiceWebView'
import SlackServiceWebView from './MailboxWebView/Slack/SlackServiceWebView'
import GenericServiceWebView from './MailboxWebView/Generic/GenericServiceWebView'
import ContainerServiceWebView from './MailboxWebView/Container/ContainerServiceWebView'
import MicrosoftMailServiceWebView from './MailboxWebView/Microsoft/MicrosoftMailServiceWebView'
import ServiceWebView from './MailboxWebView/ServiceWebView'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

const styles = {
  mailboxTab: {
    position: 'absolute',
    top: 10000,
    bottom: -10000,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  mailboxTabActive: {
    top: 0,
    bottom: 0
  },
  serviceContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}

@withStyles(styles)
class MailboxTab extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateState(this.props)
    }
  })()

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const { mailboxId } = props
    const accountState = accountStore.getState()
    return {
      isMailboxActive: accountState.activeMailboxId() === mailboxId,
      serviceManifest: this.generateServiceManifest(accountState, mailboxId)
    }
  }

  accountUpdated = (accountState) => {
    const { mailboxId } = this.props

    this.setState({
      isMailboxActive: accountState.activeMailboxId() === mailboxId,
      serviceManifest: this.generateServiceManifest(accountState, mailboxId)
    })
  }

  userUpdated = (userState) => {
    const accountState = accountStore.getState()
    this.setState({
      serviceManifest: this.generateServiceManifest(accountState, this.props.mailboxId)
    })
  }

  /**
  * Generates the service manifest of [{id, type}]
  * @param accountState: the account state to use
  * @param mailboxId: the id of the mailbox
  * @return the serviceManifest
  */
  generateServiceManifest (accountState, mailboxId) {
    return accountState
      .unrestrictedMailboxServiceIds(mailboxId)
      .map((serviceId) => {
        return {
          id: serviceId,
          type: accountState.getService(serviceId).type
        }
      })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.isMailboxActive !== nextState.isMailboxActive) { return true }
    if (this.props.mailboxId !== nextProps.mailboxId) { return true }
    if (JSON.stringify(this.state.serviceManifest) !== JSON.stringify(nextState.serviceManifest)) { return true }

    return false
  }

  /**
  * Renders an individual tab
  * @param key: the element key
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the service of the tab
  * @param serviceType: the service of the tab
  * @return jsx
  */
  renderWebView (key, mailboxId, serviceId, serviceType) {
    let ElementClass
    switch (serviceType) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
        ElementClass = GoogleMailServiceWebView; break
      case SERVICE_TYPES.GOOGLE_HANGOUTS:
        ElementClass = GoogleHangoutsServiceWebView; break
      case SERVICE_TYPES.GOOGLE_CALENDAR:
        ElementClass = GoogleCalendarServiceWebView; break
      case SERVICE_TYPES.GOOGLE_ALLO:
        ElementClass = GoogleAlloServiceWebView; break
      case SERVICE_TYPES.TRELLO:
        ElementClass = TrelloServiceWebView; break
      case SERVICE_TYPES.SLACK:
        ElementClass = SlackServiceWebView; break
      case SERVICE_TYPES.GENERIC:
        ElementClass = GenericServiceWebView; break
      case SERVICE_TYPES.CONTAINER:
        ElementClass = ContainerServiceWebView; break
      case SERVICE_TYPES.MICROSOFT_MAIL:
        ElementClass = MicrosoftMailServiceWebView; break
      default:
        ElementClass = ServiceWebView; break
    }

    return (<ElementClass mailboxId={mailboxId} serviceId={serviceId} key={key} />)
  }

  render () {
    const { className, mailboxId, classes, ...passProps } = this.props
    const {
      serviceManifest,
      isMailboxActive
    } = this.state

    // When re-ordering services, the action of moving a webview around the dom
    // can cause a reload. Particularly when the new position is lower in the tree.
    // Sorting the service types prevents this behaviour and we don't actually use
    // the ordering for anything more than sanity. Fixes #548
    const sortedServiceManifest = serviceManifest.sort((a, b) => a.id.localeCompare(b.a))
    return (
      <div
        {...passProps}
        className={classNames(
          classes.mailboxTab,
          isMailboxActive ? classes.mailboxTabActive : undefined,
          className)}>
        <div className={classes.serviceContainer}>
          {sortedServiceManifest.map(({id, type}) => {
            return this.renderWebView(id, mailboxId, id, type)
          })}
        </div>
      </div>
    )
  }
}

export default MailboxTab
