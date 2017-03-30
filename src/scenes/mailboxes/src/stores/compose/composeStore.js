const alt = require('../alt')
const actions = require('./composeActions')
const CoreService = require('shared/Models/Accounts/CoreService')
const mailboxStore = require('../mailbox/mailboxStore')
const mailboxDispatch = require('../mailbox/mailboxDispatch')
const mailboxActions = require('../mailbox/mailboxActions')

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

  handleProcessMailtoLink ({ valid, recipient, subject, body }) {
    if (!valid) { this.preventDefault(); return }

    const mailboxState = mailboxStore.getState()
    const supportingServices = mailboxState.getServicesSupportingProtocol(CoreService.PROTOCOL_TYPES.MAILTO)
    if (supportingServices.length === 0) {
      this.composeProtocol = null
      this.composeData = null
    } else {
      const composeData = {
        recipient: recipient,
        subject: subject,
        body: body
      }
      if (supportingServices.length === 1) {
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
}

module.exports = alt.createStore(ComposeStore, 'ComposeStore')
