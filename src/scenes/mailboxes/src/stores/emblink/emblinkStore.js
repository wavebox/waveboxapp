import RendererEmblinkStore from 'shared/AltStores/Emblink/RendererEmblinkStore'
import { STORE_NAME } from 'shared/AltStores/Emblink/AltEmblinkIdentifiers'
import alt from '../alt'
import actions from './emblinkActions'
//import mailboxActions from '../mailbox/mailboxActions'
//import mailboxDispatch from '../mailbox/mailboxDispatch'
//import mailboxStore from '../mailbox/mailboxStore'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

class EmblinkStore extends RendererEmblinkStore {
  /* **************************************************************************/
  // Lifecycle handlers
  /* **************************************************************************/

  handleLoad (payload) {
    super.handleLoad(payload)
    this.dispatchComposeChange()
  }

  /* **************************************************************************/
  // Compose Utils
  /* **************************************************************************/

  /**
  * Dispatches the change made by compose
  */
  dispatchComposeChange () {
    if (!this.hasCompose()) { return }

    const mailboxState = mailboxStore.getState()
    const supportingServices = mailboxState.getServicesSupportingCompose()

    // No services supporting
    if (supportingServices.length === 0) {
      ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
      actions.clearCompose.defer()
      return
    }

    // Just one service supporting
    if (supportingServices.length === 1) {
      const service = supportingServices[0]
      this.sendComposeToMailbox(service.parentId, service.type, this.compose.payload)
      return
    }

    // User defined which mailbox
    if (this.composeHasMailbox()) {
      const designated = supportingServices.find((service) => {
        return service.parentId === this.compose.mailboxId && service.type === this.compose.serviceType
      })
      if (designated) {
        this.sendComposeToMailbox(this.compose.mailboxId, this.compose.serviceType, this.compose.payload)
        return
      }
    }

    // Compose picker
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
    window.location.hash = 'incoming/compose'
  }

  /**
  * Sends the compose call to a mailbox
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @param composeData: the data to use when composing
  */
  sendComposeToMailbox (mailboxId, serviceType, composeData) {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
    mailboxActions.changeActive.defer(mailboxId, serviceType)
    mailboxDispatch.composeItem(mailboxId, serviceType, composeData || {})
    window.location.hash = '/'
    actions.clearCompose.defer()
  }

  /* **************************************************************************/
  // Compose handlers
  /* **************************************************************************/

  handleComposeNewMessage (payload) {
    super.handleComposeNewMessage(payload)
    this.dispatchComposeChange()
  }

  handleComposeNewMailtoLink (payload) {
    super.handleComposeNewMailtoLink(payload)
    this.dispatchComposeChange()
  }

  /* **************************************************************************/
  // Open handlers
  /* **************************************************************************/

  handleOpenItem (payload) {
    super.handleOpenItem(payload)

    if (this.hasOpenItem()) {
      ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
      mailboxActions.changeActive.defer(this.open.mailboxId, this.open.serviceType)
      mailboxDispatch.openItem(this.open.mailboxId, this.open.serviceType, this.open.payload)
      actions.clearOpenItem.defer()
    }
  }
}
export default alt.createStore(EmblinkStore, STORE_NAME)
