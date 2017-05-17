import alt from '../alt'
import actions from './composeActions'
import CoreService from 'shared/Models/Accounts/CoreService'
import mailboxStore from '../mailbox/mailboxStore'
import mailboxDispatch from '../mailbox/mailboxDispatch'
import mailboxActions from '../mailbox/mailboxActions'

class ComposeStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.composeData = null
    this.composeProtocol = null

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleComposeNewMessage: actions.COMPOSE_NEW_MESSAGE,
      handleCancelCompose: actions.CANCEL_COMPOSE,
      handleComposeMessageInMailbox: actions.COMPOSE_MESSAGE_IN_MAILBOX,
      handleProcessMailtoLink: actions.PROCESS_MAILTO_LINK
    })
  }

  /* **************************************************************************/
  // New Message
  /* **************************************************************************/

  handleComposeNewMessage () {
    const mailboxState = mailboxStore.getState()
    const supportingServices = mailboxState.getServicesSupportingCompose()
    if (supportingServices.length === 0) {
      this.composeProtocol = null
      this.composeData = null
    } else if (supportingServices.length === 1) {
      this.composeProtocol = null
      this.composeData = null
      const service = supportingServices[0]
      window.location.hash = '/'
      mailboxActions.changeActive.defer(service.parentId, service.type)
      mailboxDispatch.composeItem(service.parentId, service.type, {})
    } else {
      this.composeProtocol = null
      this.composeData = {}
      window.location.hash = 'incoming/compose'
    }
  }

  handleCancelCompose () {
    this.composeProtocol = null
    this.composeData = null
    window.location.hash = '/'
  }

  handleComposeMessageInMailbox ({ mailboxId, serviceType }) {
    const composeData = this.composeData
    this.composeProtocol = null
    this.composeData = null
    window.location.hash = '/'
    mailboxActions.changeActive.defer(mailboxId, serviceType)
    mailboxDispatch.composeItem(mailboxId, serviceType, composeData)
  }

  /* **************************************************************************/
  // Mailto
  /* **************************************************************************/

  handleProcessMailtoLink ({ valid, recipient, subject, body, preferredMailboxId, preferredServiceType }) {
    if (!valid) { this.preventDefault(); return }

    const protocol = CoreService.PROTOCOL_TYPES.MAILTO
    const mailboxState = mailboxStore.getState()
    const supportingServices = mailboxState.getServicesSupportingProtocol(protocol)
    const composeData = {
      recipient: recipient,
      subject: subject,
      body: body
    }

    // If we're given a preferred service and or mailbox check the validity and see if we can dispatch
    if (preferredMailboxId) {
      const mailbox = mailboxState.getMailbox(preferredMailboxId)
      let service
      if (mailbox) {
        if (preferredServiceType) {
          const preferredService = mailbox.serviceForType(preferredServiceType)
          if (preferredService && preferredService.supportedProtocols.has(protocol)) {
            service = preferredService
          }
        } else {
          const availableServices = mailbox.enabledServices.filter((service) => service.supportedProtocols.has(protocol))
          if (availableServices.length === 1) {
            service = availableServices[0]
          }
        }
      }

      if (mailbox && service) {
        this.composeProtocol = null
        this.composeData = null
        window.location.hash = '/'
        mailboxActions.changeActive.defer(service.parentId, service.type)
        mailboxDispatch.composeItem(service.parentId, service.type, composeData)
        return
      }
    }

    // No preferred/invalid preferred ask the user
    if (supportingServices.length === 0) {
      this.composeProtocol = null
      this.composeData = null
    } else if (supportingServices.length === 1) {
      this.composeProtocol = null
      this.composeData = null
      window.location.hash = '/'
      const service = supportingServices[0]
      mailboxActions.changeActive.defer(service.parentId, service.type)
      mailboxDispatch.composeItem(service.parentId, service.type, composeData)
    } else {
      this.composeProtocol = CoreService.PROTOCOL_TYPES.MAILTO
      this.composeData = composeData
      window.location.hash = 'incoming/compose'
    }
  }
}

export default alt.createStore(ComposeStore, 'ComposeStore')
