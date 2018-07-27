import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountDispatch, accountStore, accountActions } from 'stores/account'
import { slackActions } from 'stores/slack'
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
      this.setState(this.generateState(nextProps.serviceId, accountStore.getState()))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props.serviceId, accountStore.getState())

  /**
  * Generates the state from the given props
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return state object
  */
  generateState (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)
    const serviceAuth = accountState.getMailboxAuthForServiceId(serviceId)

    return {
      ...(service && serviceData && serviceAuth ? {
        authTeamId: serviceAuth.authTeamId,
        url: service.getUrlWithData(serviceData, serviceAuth)
      } : {
        authTeamId: undefined,
        url: undefined
      }),
      isActive: accountState.activeServiceId() === serviceId,
      isSearching: accountState.isSearchingService(serviceId),
      searchTerm: accountState.serviceSearchTerm(serviceId),
      searchId: accountState.serviceSearchHash(serviceId)
    }
  }

  accountUpdated = (accountState) => {
    this.setState(this.generateState(this.props.serviceId, accountState))
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
      const { authTeamId, url } = this.state
      if (evt.data.launchUri) {
        this.refs[REF].executeJavaScript(`TS.client.handleDeepLink('${evt.data.launchUri}');`)
      } else if (evt.data.channelId) {
        this.refs[REF].executeJavaScript(`TS.client.handleDeepLink('slack://channel?id=${evt.data.channelId}&team=${authTeamId}');`)
      } else {
        this.refs[REF].loadURL(url)
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
        slackActions.scheduleHTML5Notification(
          this.props.serviceId,
          evt.channel.notificationId,
          evt.channel.notification,
          (notificationId) => {
            this.refs[REF].send(WB_BROWSER_NOTIFICATION_CLICK, { notificationId: notificationId })
          }
        )
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
      <CoreServiceWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        hasSearch={false}
        plugHTML5Notifications={false}
        ipcMessage={this.handleWebViewIPCMessage} />
    )
  }
}
