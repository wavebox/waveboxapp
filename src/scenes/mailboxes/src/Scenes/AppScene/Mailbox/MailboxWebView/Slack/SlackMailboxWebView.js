import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { mailboxDispatch, mailboxStore, MailboxLinker } from 'stores/mailbox'
import URI from 'urijs'

const REF = 'mailbox_tab'

export default class SlackMailboxWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxUpdated)
    mailboxDispatch.on('openItem', this.handleOpenItem)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
    mailboxDispatch.removeListener('openItem', this.handleOpenItem)
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
      mailbox: mailboxStore.getState().getMailbox(props.mailboxId)
    }
  }

  mailboxUpdated = (mailboxState) => {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.mailboxId)
    })
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem = (evt) => {
    if (evt.mailboxId === this.props.mailboxId && evt.service === CoreService.SERVICE_TYPES.DEFAULT) {
      const service = this.state.mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT)
      if (evt.data.channelId) {
        const url = URI(service.url).pathname('/messages/' + evt.data.channelId).toString()
        this.refs[REF].loadURL(url)
      } else {
        this.refs[REF].loadURL(service.url)
      }
    }
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Opens a new url in the correct way
  * @param url: the url to open
  */
  handleOpenNewWindow (url) {
    MailboxLinker.openExternalWindow(url)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/serviceTooling'
        mailboxId={mailboxId}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
}
