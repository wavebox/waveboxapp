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
const DOC_TITLE_UNREAD_RES = [
  new RegExp('^[(]([0-9]+)[)].*?$'),
  new RegExp('^.*?[(]([0-9]+)[)]$')
]

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
    this.titleUpdateWaiter = null
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
    clearTimeout(this.titleUpdateWaiter)
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
    return {
      ...this.generateMailboxState(props, mailboxStore.getState()),
      isolateMailboxProcesses: settingsStore.getState().launched.app.isolateMailboxProcesses // does not update
    }
  }

  /**
  * Generates the state from the given props derived from the mailbox state
  * @param props: the props to use
  * @param mailboxState: the current mailbox state
  * @return state object
  */
  generateMailboxState (props, mailboxState) {
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    return {
      useNativeWindowOpen: service ? service.useNativeWindowOpen : true,
      useContextIsolation: service ? service.useContextIsolation : true,
      useSharedSiteInstances: service ? service.useSharedSiteInstances : true,
      useAsyncAlerts: service ? service.useAsyncAlerts : true,
      documentTitleHasUnread: service ? service.documentTitleHasUnread : false,
      documentTitleUnreadBlinks: service ? service.documentTitleUnreadBlinks : false
    }
  }

  mailboxChanged = (mailboxState) => {
    this.setState(this.generateMailboxState(this.props, mailboxState))
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
    const { useAsyncAlerts, documentTitleHasUnread } = this.state
    this.refs[REF].send(WB_BROWSER_CONFIGURE_ALERT, {
      async: useAsyncAlerts
    })

    if (documentTitleHasUnread) {
      this.updateUnreadFromDocumentTitle(this.refs[REF].getTitle(), true)
    } else {
      // Always dispatch this in case we revoke the unread setting from the config!
      mailboxActions.reduceService(
        this.props.mailboxId,
        CoreService.SERVICE_TYPES.DEFAULT,
        ContainerDefaultServiceReducer.setDocumentTitleUnreadCount,
        0
      )
    }
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

  /**
  * Handles the page title updating
  * @param evt: the event that fired
  */
  handlePageTitleUpdated = (evt) => {
    const { documentTitleHasUnread } = this.state
    if (documentTitleHasUnread) {
      this.updateUnreadFromDocumentTitle(evt.title, false)
    }
  }

  /* **************************************************************************/
  // Change handlers
  /* **************************************************************************/

  /**
  * Updates the unread count from the document title
  * @param title: the new title
  * @param forceWait: set to true to force a short wait, false to update by normal procedure
  */
  updateUnreadFromDocumentTitle (title, forceWait) {
    const { mailboxId } = this.props
    const { documentTitleHasUnread, documentTitleUnreadBlinks } = this.state
    if (!documentTitleHasUnread) { return }

    // Parse the count
    let hasCount = false
    let count = 0
    DOC_TITLE_UNREAD_RES.find((re) => {
      const match = re.exec(title || '')
      if (match) {
        const matchCount = parseInt(match[1])
        if (!isNaN(matchCount)) {
          hasCount = true
          count = matchCount
        }
      }
      return hasCount
    })

    // Run the update depending on how we are configured
    clearTimeout(this.titleUpdateWaiter)
    if (forceWait) {
      // Wait a little and then update
      this.titleUpdateWaiter = setTimeout(() => {
        mailboxActions.reduceService(
          mailboxId,
          CoreService.SERVICE_TYPES.DEFAULT,
          ContainerDefaultServiceReducer.setDocumentTitleUnreadCount,
          count
        )
      }, 2000)
    } else if (documentTitleUnreadBlinks && !hasCount) {
      // We recognize this site blinks, so wait before nulling it out
      this.titleUpdateWaiter = setTimeout(() => {
        mailboxActions.reduceService(
          mailboxId,
          CoreService.SERVICE_TYPES.DEFAULT,
          ContainerDefaultServiceReducer.setDocumentTitleUnreadCount,
          0
        )
      }, 5000)
    } else {
      // We found a count so set immediately
      mailboxActions.reduceService(
        mailboxId,
        CoreService.SERVICE_TYPES.DEFAULT,
        ContainerDefaultServiceReducer.setDocumentTitleUnreadCount,
        count
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
        domReady={this.handleDOMReady}
        pageTitleUpdated={this.handlePageTitleUpdated} />
    )
  }
}
