import PropTypes from 'prop-types'
import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import { userStore } from 'stores/user'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import CoreService from 'shared/Models/Accounts/CoreService'
import GoogleMailboxMailWebView from './MailboxWebView/Google/GoogleMailboxMailWebView'
import GoogleMailboxCommunicationWebView from './MailboxWebView/Google/GoogleMailboxCommunicationWebView'
import GoogleMailboxCalendarWebView from './MailboxWebView/Google/GoogleMailboxCalendarWebView'
import GoogleMailboxMessengerWebView from './MailboxWebView/Google/GoogleMailboxMessengerWebView'
import GoogleMailboxTeamWebView from './MailboxWebView/Google/GoogleMailboxTeamWebView'
import TrelloMailboxWebView from './MailboxWebView/Trello/TrelloMailboxWebView'
import SlackMailboxWebView from './MailboxWebView/Slack/SlackMailboxWebView'
import GenericMailboxDefaultServiceWebView from './MailboxWebView/Generic/GenericMailboxDefaultServiceWebView'
import MicrosoftMailboxMailWebView from './MailboxWebView/Microsoft/MicrosoftMailboxMailWebView'
import MicrosoftMailboxTeamWebView from './MailboxWebView/Microsoft/MicrosoftMailboxTeamWebView'
import MailboxServiceWebView from './MailboxWebView/MailboxServiceWebView'
import ContainerMailboxDefaultServiceWebView from './MailboxWebView/Container/ContainerMailboxDefaultServiceWebView'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'

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
export default class MailboxTab extends React.Component {
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
    mailboxStore.listen(this.mailboxUpdated)
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
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

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const mailboxState = mailboxStore.getState()
    const userState = userStore.getState()
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    return {
      isMailboxActive: mailboxState.activeMailboxId() === props.mailboxId,
      userHasServices: userState.user.hasServices,
      serviceTypes: mailbox.enabledServiceTypes,
      mailboxType: mailbox.type
    }
  }

  mailboxUpdated = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    if (!mailbox) { return }
    this.setState({
      isMailboxActive: mailboxState.activeMailboxId() === this.props.mailboxId,
      serviceTypes: mailbox.enabledServiceTypes,
      mailboxType: mailbox.type
    })
  }

  userUpdated = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.isMailboxActive !== nextState.isMailboxActive) { return true }
    if (this.props.mailboxId !== nextProps.mailboxId) { return true }
    if (this.state.mailboxType !== nextState.mailboxType) { return true }
    if (JSON.stringify(this.state.serviceTypes) !== JSON.stringify(nextState.serviceTypes)) { return true }
    if (this.state.userHasServices !== nextState.userHasServices) { return true }

    return false
  }

  /**
  * Renders an individual tab
  * @param key: the element key
  * @param mailboxType: the type of mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the service of the tab
  * @return jsx
  */
  renderWebView (key, mailboxType, mailboxId, serviceType) {
    if (mailboxType === CoreMailbox.MAILBOX_TYPES.GOOGLE) {
      switch (serviceType) {
        case CoreService.SERVICE_TYPES.DEFAULT:
          return (<GoogleMailboxMailWebView mailboxId={mailboxId} key={key} />)
        case CoreService.SERVICE_TYPES.COMMUNICATION:
          return (<GoogleMailboxCommunicationWebView mailboxId={mailboxId} key={key} />)
        case CoreService.SERVICE_TYPES.CALENDAR:
          return (<GoogleMailboxCalendarWebView mailboxId={mailboxId} key={key} />)
        case CoreService.SERVICE_TYPES.MESSENGER:
          return (<GoogleMailboxMessengerWebView mailboxId={mailboxId} key={key} />)
        case CoreService.SERVICE_TYPES.TEAM:
          return (<GoogleMailboxTeamWebView mailboxId={mailboxId} key={key} />)
      }
    } else if (mailboxType === CoreMailbox.MAILBOX_TYPES.TRELLO) {
      return (<TrelloMailboxWebView mailboxId={mailboxId} key={key} />)
    } else if (mailboxType === CoreMailbox.MAILBOX_TYPES.SLACK) {
      return (<SlackMailboxWebView mailboxId={mailboxId} key={key} />)
    } else if (mailboxType === CoreMailbox.MAILBOX_TYPES.MICROSOFT) {
      switch (serviceType) {
        case CoreService.SERVICE_TYPES.DEFAULT:
          return (<MicrosoftMailboxMailWebView mailboxId={mailboxId} key={key} />)
        case CoreService.SERVICE_TYPES.TEAM:
          return (<MicrosoftMailboxTeamWebView mailboxId={mailboxId} key={key} />)
      }
    } else if (mailboxType === CoreMailbox.MAILBOX_TYPES.GENERIC) {
      return (<GenericMailboxDefaultServiceWebView mailboxId={mailboxId} key={key} />)
    } else if (mailboxType === CoreMailbox.MAILBOX_TYPES.CONTAINER) {
      return (<ContainerMailboxDefaultServiceWebView mailboxId={mailboxId} key={key} />)
    }

    return (<MailboxServiceWebView mailboxId={mailboxId} serviceType={serviceType} key={key} />)
  }

  render () {
    const { className, mailboxId, classes, ...passProps } = this.props
    const {
      mailboxType,
      serviceTypes,
      userHasServices,
      isMailboxActive
    } = this.state

    // When re-ordering services, the action of moving a webview around the dom
    // can cause a reload. Particularly when the new position is lower in the tree.
    // Sorting the service types prevents this behaviour and we don't actually use
    // the ordering for anything more than sanity. Fixes #548
    const allowedServiceTypes = (userHasServices ? serviceTypes : [CoreMailbox.SERVICE_TYPES.DEFAULT]).sort()
    return (
      <div
        {...passProps}
        className={classNames(
          classes.mailboxTab,
          isMailboxActive ? classes.mailboxTabActive : undefined,
          className)}>
        <div className={classes.serviceContainer}>
          {allowedServiceTypes.map((serviceType) => {
            return this.renderWebView(serviceType, mailboxType, mailboxId, serviceType)
          })}
        </div>
      </div>
    )
  }
}
