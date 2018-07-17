import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebViewHibernator from '../CoreServiceWebViewHibernator'
import { accountStore, accountActions } from 'stores/account'
import ContainerServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/ContainerServiceDataReducer'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_BROWSER_NOTIFICATION_PRESENT,
  WB_BROWSER_CONFIGURE_ALERT
} from 'shared/ipcEvents'

const REF = 'mailbox_tab'
const DOC_TITLE_UNREAD_RES = [
  new RegExp('^[(]([0-9]+)[)].*?$'), // (12) text
  new RegExp('^.*?[(]([0-9]+)[)]$'), // text (12)
  new RegExp('^[\\[]([0-9]+)[\\]].*?$'), // [12] text
  new RegExp('^.*?[\\[]([0-9]+)[\\]]$') // text [12]
]
const DOC_TITLE_UNREAD_CONVERTS = {
  '➀': 1,
  '➁': 2,
  '➂': 3,
  '➃': 4,
  '➄': 5,
  '➅': 6,
  '➆': 7,
  '➇': 8,
  '➈': 9,
  '➉': 10,
  '❶': 1,
  '❷': 2,
  '❸': 3,
  '❹': 4,
  '❺': 5,
  '❻': 6,
  '❼': 7,
  '❽': 8,
  '❾': 9,
  '❿': 10
}

export default class ContainerServiceWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    this.titleUpdateWaiter = null
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
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
      ...this.generateAccountState(props, accountStore.getState())
    }
  }

  /**
  * Generates the state from the given props derived from the mailbox state
  * @param props: the props to use
  * @param accountState: the current account state
  * @return state object
  */
  generateAccountState (props, accountState) {
    const service = accountState.getService(props.serviceId)
    return {
      ...(service ? {
        useAsyncAlerts: service.container.useAsyncAlerts,
        documentTitleHasUnread: service.container.documentTitleHasUnread,
        documentTitleUnreadBlinks: service.container.documentTitleUnreadBlinks,
        faviconUnreadActivityRegexp: service.container.faviconUnreadActivityRegexp
      } : {
        useAsyncAlerts: true,
        documentTitleHasUnread: false,
        documentTitleUnreadBlinks: false,
        faviconUnreadActivityRegexp: undefined
      })
    }
  }

  accountChanged = (accountState) => {
    this.setState(this.generateAccountState(this.props, accountState))
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
    const { useAsyncAlerts, documentTitleHasUnread, faviconUnreadActivityRegexp } = this.state
    this.refs[REF].send(WB_BROWSER_CONFIGURE_ALERT, {
      async: useAsyncAlerts
    })

    if (documentTitleHasUnread) {
      this.updateUnreadFromDocumentTitle(this.refs[REF].getTitle(), true)
    } else {
      // Always dispatch this in case we revoke the unread setting from the config!
      accountActions.reduceServiceData(
        this.props.serviceId,
        ContainerServiceDataReducer.setDocumentTitleUnreadCount,
        0
      )
    }
    if (!faviconUnreadActivityRegexp) {
      // Always dispatch this in case we revoke the unread setting from the config!
      accountActions.reduceServiceData(
        this.props.serviceId,
        ContainerServiceDataReducer.setFaviconIndicatesUnreadActivity,
        false
      )
    }
  }

  /**
  * Handles the browser presenting a notification
  */
  handleBrowserNotificationPresented = () => {
    accountActions.reduceServiceDataIfInactive(
      this.props.serviceId,
      ContainerServiceDataReducer.notificationPresented
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

  /**
  * Handles the page favicon updating
  * @param evt: the event that fired
  */
  handlePageFaviconUpdated = (evt) => {
    const { faviconUnreadActivityRegexp } = this.state
    if (!faviconUnreadActivityRegexp) { return }

    let indicates
    try {
      const re = new RegExp(faviconUnreadActivityRegexp)
      indicates = !!evt.favicons.find((fav) => re.exec(fav) !== null)
    } catch (ex) {
      indicates = false
    }

    accountActions.reduceServiceData(
      this.props.serviceId,
      ContainerServiceDataReducer.setFaviconIndicatesUnreadActivity,
      indicates
    )
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
    const { documentTitleHasUnread, documentTitleUnreadBlinks } = this.state
    if (!documentTitleHasUnread) { return }
    title = title || ''

    // Check the title for a regex count match
    let hasCount = false
    let count = 0
    DOC_TITLE_UNREAD_RES.find((re) => {
      const match = re.exec(title)
      if (match) {
        const matchCount = parseInt(match[1])
        if (!isNaN(matchCount)) {
          hasCount = true
          count = matchCount
        }
      }
      return hasCount
    })

    // Check the title for a prefix or suffix count
    if (!hasCount) {
      if (DOC_TITLE_UNREAD_CONVERTS[title[0]] !== undefined) {
        count = DOC_TITLE_UNREAD_CONVERTS[title[0]]
        hasCount = true
      } else if (DOC_TITLE_UNREAD_CONVERTS[title[title.length - 1]] !== undefined) {
        count = DOC_TITLE_UNREAD_CONVERTS[title[title.length - 1]]
        hasCount = true
      }
    }

    // Run the update depending on how we are configured
    clearTimeout(this.titleUpdateWaiter)
    if (forceWait) {
      // Wait a little and then update
      this.titleUpdateWaiter = setTimeout(() => {
        accountActions.reduceServiceData(
          this.props.serviceId,
          ContainerServiceDataReducer.setDocumentTitleUnreadCount,
          count
        )
      }, 2000)
    } else if (documentTitleUnreadBlinks && !hasCount) {
      // We recognize this site blinks, so wait before nulling it out
      this.titleUpdateWaiter = setTimeout(() => {
        accountActions.reduceServiceData(
          this.props.serviceId,
          ContainerServiceDataReducer.setDocumentTitleUnreadCount,
          0
        )
      }, 5000)
    } else {
      // We found a count so set immediately
      accountActions.reduceServiceData(
        this.props.serviceId,
        ContainerServiceDataReducer.setDocumentTitleUnreadCount,
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
    const { mailboxId, serviceId } = this.props

    return (
      <CoreServiceWebViewHibernator
        ref={REF}
        mailboxId={mailboxId}
        serviceId={serviceId}
        ipcMessage={this.handleIPCMessage}
        domReady={this.handleDOMReady}
        pageTitleUpdated={this.handlePageTitleUpdated}
        pageFaviconUpdated={this.handlePageFaviconUpdated} />
    )
  }
}
