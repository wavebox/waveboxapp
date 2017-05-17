import PropTypes from 'prop-types'
import React from 'react'
import MailboxWebViewHibernator from '../MailboxWebViewHibernator'
import CoreService from 'shared/Models/Accounts/CoreService'
import { MailboxLinker, mailboxStore } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'

const REF = 'mailbox_tab'

export default class GenericMailboxDefaultServiceWebView extends React.Component {
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
    const mailbox = mailboxStore.getState().getMailbox(props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    return {
      openWindowsExternally: service ? service.openWindowsExternally : false,
      url: service ? service.url : undefined
    }
  }

  mailboxChanged = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    const service = mailbox ? mailbox.serviceForType(CoreService.SERVICE_TYPES.DEFAULT) : null
    this.setState({
      openWindowsExternally: service ? service.openWindowsExternally : false,
      url: service ? service.url : undefined
    })
  }

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Opens a new url in the correct way
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    if (this.state.openWindowsExternally) {
      MailboxLinker.openExternalWindow(evt.url)
    } else {
      MailboxLinker.openContentWindow(this.props.mailboxId, evt.url, evt.options)
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
    const { url } = this.state

    return (
      <MailboxWebViewHibernator
        ref={REF}
        preload='../platform/webviewInjection/genericDefaultServiceTooling'
        mailboxId={mailboxId}
        url={url}
        serviceType={CoreService.SERVICE_TYPES.DEFAULT}
        newWindow={this.handleOpenNewWindow} />
    )
  }
}
