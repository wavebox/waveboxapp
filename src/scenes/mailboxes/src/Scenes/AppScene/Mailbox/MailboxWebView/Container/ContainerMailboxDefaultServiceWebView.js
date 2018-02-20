import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxStore, mailboxActions, ContainerDefaultServiceReducer } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_CONFIGURE_ALERT
} from 'shared/ipcEvents'
import Resolver from 'Runtime/Resolver'

const REF = 'mailbox_tab'

export default class ContainerMailboxDefaultServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
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
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    return {
      useNativeWindowOpen: service ? service.useNativeWindowOpen : true,
      useContextIsolation: service ? service.useContextIsolation : true,
      useSharedSiteInstances: service ? service.useSharedSiteInstances : true,
      useAsyncAlerts: service ? service.useAsyncAlerts : true,
      isolateMailboxProcesses: settingsStore.getState().launched.app.isolateMailboxProcesses // does not update
    }
  }

  mailboxChanged = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    this.setState({
      useNativeWindowOpen: service ? service.useNativeWindowOpen : true,
      useContextIsolation: service ? service.useContextIsolation : true,
      useSharedSiteInstances: service ? service.useSharedSiteInstances : true,
      useAsyncAlerts: service ? service.useAsyncAlerts : true
    })
  }

  /* **************************************************************************/
  // Browser Events : Dispatcher
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  handleIPCMessage = (evt) => {
    switch (evt.channel.type) {
      case WB_BROWSER_NOTIFICATION_PRESENT: this.handleBrowserNotificationPresented(); break
      default: break
    }
  }

  /**
  * Handles the dom being ready
  */
  handleDOMReady = (evt) => {
    this.refs[REF].send(WB_BROWSER_CONFIGURE_ALERT, {
      async: this.state.useAsyncAlerts
    })
  }

  /**
  * Handles the browser presenting a notification
  */
  handleBrowserNotificationPresented = () => {
    mailboxActions.reduceServiceIfInactive(
      this.props.mailboxId,
      CoreService.SERVICE_TYPES.DEFAULT,
      ContainerDefaultServiceReducer.notificationPresented
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId } = this.props
    const {
      useNativeWindowOpen,
      useContextIsolation,
      useSharedSiteInstances,
      isolateMailboxProcesses
    } = this.state

    let affinityOpt
    if (useSharedSiteInstances) {
      if (isolateMailboxProcesses) {
        affinityOpt = `affinity=${mailboxId + ':' + CoreService.SERVICE_TYPES.DEFAULT}`
      } else {
        affinityOpt = `affinity=${mailboxId}`
      }
    }

    // Don't use string templating or inline in jsx. The compiler optimizes it out!!
    const webpreferences = [
      'contextIsolation=' + (useContextIsolation ? 'yes' : 'no'),
      'nativeWindowOpen=' + (useNativeWindowOpen ? 'yes' : 'no'),
      'sharedSiteInstances=' + (useSharedSiteInstances ? 'yes' : 'no'),
      affinityOpt
    ].filter((l) => !!l).join(', ')

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload={Resolver.guestPreload()}
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        webpreferences={webpreferences}
        ipcMessage={this.handleIPCMessage}
        domReady={this.handleDOMReady} />
    )
  }
}
