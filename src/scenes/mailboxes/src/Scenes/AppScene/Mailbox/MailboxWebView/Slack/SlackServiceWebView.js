import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import { accountDispatch, accountStore, accountActions } from 'stores/account'
//import { slackActions } from 'stores/slack'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_NOTIFICATION_CLICK
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'

export default class SlackServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
    accountDispatch.on('openItem', this.handleOpenItem)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
    accountDispatch.removeListener('openItem', this.handleOpenItem)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
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
    const { serviceId } = props
    const accountState = accountStore.getState()
    return {
      service: accountState.getService(serviceId),
      isActive: accountState.isActiveService(serviceId),
      isSearching: accountState.isSearchingService(serviceId),
      searchTerm: accountState.serviceSearchTerm(serviceId),
      searchId: accountState.serviceSearchHash(serviceId)
    }
  }

  accountUpdated = (accountState) => {
    this.setState(this.generateState(accountState, this.props))
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      const { service } = this.state
      if (!service) { return }

      if (evt.data.launchUri) {
        this.refs[REF].executeJavaScript(`TS.client.handleDeepLink('${evt.data.launchUri}');`)
      } else if (evt.data.channelId) {
        this.refs[REF].executeJavaScript(`TS.client.handleDeepLink('slack://channel?id=${evt.data.channelId}&team=${service.authTeamId}');`) //service.authTeamId will be undefined
      } else {
        //this.refs[REF].loadURL(service.url)
      }
    }
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles any ipc messages
  * @param evt: the event that fired
  */
  handleWebViewIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_NOTIFICATION_PRESENT:
        /*slackActions.scheduleHTML5Notification(
          this.props.mailboxId,
          evt.channel.notificationId,
          evt.channel.notification,
          (notificationId) => {
            this.refs[REF].send(WB_BROWSER_NOTIFICATION_CLICK, { notificationId: notificationId })
          }
        )*/
        break
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  componentDidUpdate (prevProps, prevState) {
    // Look for the state change for starting to search or changing search and
    // then try to push that into the slack search in the webview
    if (this.state.isActive) {
      if (this.state.isSearching !== prevState.isSearching || this.state.searchId !== prevState.searchId) {
        if (this.state.isSearching) {
          this.refs[REF].executeJavaScript(`document.querySelector('.search_input>[contenteditable]').focus()`)
          accountActions.untrackSearchingService.defer(this.props.serviceId)
        }
      }
    }
  }

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        hasSearch={false}
        plugHTML5Notifications={false}
        ipcMessage={this.handleWebViewIPCMessage} />
    )
  }
}
