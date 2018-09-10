import RendererEmblinkStore from 'shared/AltStores/Emblink/RendererEmblinkStore'
import { STORE_NAME } from 'shared/AltStores/Emblink/AltEmblinkIdentifiers'
import alt from '../alt'
import actions from './emblinkActions'
import accountActions from '../account/accountActions'
import accountDispatch from '../account/accountDispatch'
import accountStore from '../account/accountStore'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

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

    const accountState = accountStore.getState()
    const supportingServices = [].concat(
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL),
      accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_INBOX),
      accountState.allServicesOfType(SERVICE_TYPES.MICROSOFT_MAIL)
    )

    // No services supporting
    if (supportingServices.length === 0) {
      ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
      actions.clearCompose.defer()
      return
    }

    // Just one service supporting
    if (supportingServices.length === 1) {
      const service = supportingServices[0]
      this.sendComposeToMailbox(service.id, this.compose.payload)
      return
    }

    // User defined which mailbox
    if (this.composeHasMailbox()) {
      const designated = supportingServices.find((service) => {
        return service.id === this.compose.serviceId
      })
      if (designated) {
        this.sendComposeToMailbox(this.compose.serviceId, this.compose.payload)
        return
      }
    }

    // Compose picker
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
    window.location.hash = 'incoming/compose'
  }

  /**
  * Sends the compose call to a mailbox
  * @param serviceId: the id of the service
  * @param composeData: the data to use when composing
  */
  sendComposeToMailbox (serviceId, composeData) {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW)
    accountActions.changeActiveService.defer(serviceId)
    accountDispatch.composeItem(serviceId, composeData || {})
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
      accountActions.changeActiveService.defer(this.open.serviceId)
      accountDispatch.openItem(this.open.serviceId, this.open.payload)
      actions.clearOpenItem.defer()
    }
  }
}
export default alt.createStore(EmblinkStore, STORE_NAME)
