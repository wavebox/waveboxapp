import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebView from '../../CoreServiceWebView'
import { accountDispatch, accountStore, accountActions } from 'stores/account'
import { slackActions } from 'stores/slack'
import { URL } from 'url'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_NOTIFICATION_CLICK
} from 'shared/ipcEvents'

export default class SlackServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.webviewRef = React.createRef()
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
    if (!this.webviewRef.current) { return }
    if (evt.serviceId === this.props.serviceId) {
      const { authTeamId, url } = this.state
      if (evt.data.global === 'vall_threads') {
        this.webviewRef.current.executeJavaScript(
          `window.slackDebug
            ? (window.slackDebug.router.navigateToRoute('ROUTE_ENTITY', { teamId: '${authTeamId}', entityId: 'threads' }))
            : TS.redux.dispatch(TS.interop.actions.displayModelOrViewById({ id: 'Vall_threads' }))
          `
        )
      } else {
        let channelLaunch
        if (evt.data.launchUri && evt.data.launchUri.startsWith('slack://channel?')) {
          try {
            const launchUri = new URL(evt.data.launchUri)
            channelLaunch = {
              channelId: launchUri.searchParams.get('channelId') || evt.data.channelId,
              timestamp: launchUri.searchParams.get('message'),
              teamId: launchUri.searchParams.get('team') || authTeamId
            }
          } catch (ex) {
            if (evt.data.channelId) {
              channelLaunch = {
                channelId: evt.data.channelId,
                teamId: authTeamId
              }
            }
          }
        } else if (evt.data.channelId) {
          channelLaunch = {
            channelId: evt.data.channelId,
            teamId: authTeamId
          }
        }

        if (channelLaunch) {
          const routeStr = JSON.stringify({
            teamId: channelLaunch.teamId,
            entityId: channelLaunch.channelId
          })
          const urlStr = evt.data.launchUri ? evt.data.launchUri : [
            `slack://channel`,
            `?id=${channelLaunch.channelId}`,
            `&team=${channelLaunch.teamId}`
          ].join('')
          this.webviewRef.current.executeJavaScript(
            `window.slackDebug
              ? (window.slackDebug.router.navigateToRoute('ROUTE_ENTITY', ${routeStr}))
              : (window.TS.client.handleDeepLink('${urlStr}'))
            `
          )
        } else {
          this.webviewRef.current.loadURL(url)
        }
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
            if (this.webviewRef.current) {
              this.webviewRef.current.send(WB_BROWSER_NOTIFICATION_CLICK, { notificationId: notificationId })
            }
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
          if (this.webviewRef.current) {
            this.webviewRef.current.executeJavaScript(`document.querySelector('.search_input>[contenteditable]').focus()`)
            accountActions.untrackSearchingService.defer(this.props.serviceId)
          }
        }
      }
    }
  }

  render () {
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebView
        ref={this.webviewRef}
        mailboxId={mailboxId}
        serviceId={serviceId}
        hasSearch={false}
        plugHTML5Notifications={false}
        ipcMessage={this.handleWebViewIPCMessage} />
    )
  }
}
