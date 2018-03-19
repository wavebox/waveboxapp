import RendererUserActions from 'shared/AltStores/User/RendererUserActions'
import alt from '../alt'
import { ipcRenderer } from 'electron'
import { WB_AUTH_WAVEBOX_COMPLETE, WB_AUTH_WAVEBOX_ERROR } from 'shared/ipcEvents'

class UserActions extends RendererUserActions {
  /* **************************************************************************/
  // Extensions
  /* **************************************************************************/

  /**
  * Indicates for the store to load extensions from the web
  */
  updateExtensions () { return {} }

  /**
  * Starts auto updates the extensions after a period
  */
  startAutoUpdateExtensions () { return {} }

  /**
  * Stops auto updates the extensions after a period
  */
  stopAutoUpdateExtensions () { return {} }

  /* **************************************************************************/
  // Wire config
  /* **************************************************************************/

  /**
  * Indicates for the store update the wire config
  */
  updateWireConfig () { return {} }

  /**
  * Starts auto updates the wire config after a period
  */
  startAutoUpdateWireConfig () { return {} }

  /**
  * Stops auto updates the wire config after a period
  */
  stopAutoUpdateWireConfig () { return {} }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  /**
  * Adds a new container in this thread but also the main thread
  * @param id: the id of the container
  * @param data: the data for the container
  */
  sideloadContainerLocally (id, data) {
    this.addContainers({ [id]: data })
    return { id, data }
  }

  /**
  * Indicates for the store update the containers
  */
  updateContainers () { return {} }

  /**
  * Starts auto updates the containers after a period
  */
  startAutoUpdateContainers () { return {} }

  /**
  * Stops auto updates the containers after a period
  */
  stopAutoUpdateContainers () { return {} }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Starts the auth process with an existing mailbox
  * @param mailbox: the mailbox to auth against
  * @param serverArgs={}: an args dict to pass to the server
  */
  authenticateWithMailbox (mailbox, serverArgs = {}) {
    return { id: mailbox.id, type: mailbox.type, serverArgs: serverArgs }
  }

  /**
  * Starts the auth process a google account
  * @param serverArgs={}: an args dict to pass to the server
  */
  authenticateWithGoogle (serverArgs = {}) {
    return { serverArgs: serverArgs }
  }

  /**
  * Starts the auth process a microsoft account
  * @param serverArgs={}: an args dict to pass to the server
  */
  authenticateWithMicrosoft (serverArgs = {}) {
    return { serverArgs: serverArgs }
  }

  /* **************************************************************************/
  // Auth Callbacks
  /* **************************************************************************/

  /**
  * Handles a authentication ending in success
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authenticationSuccess (evt, data) {
    return {
      id: data.id,
      type: data.type,
      next: data.next
    }
  }

  /**
  * Handles an authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  authenticationFailure (evt, data) {
    return { evt: evt, data: data }
  }
}

const actions = alt.createActions(UserActions)

// Auth
ipcRenderer.on(WB_AUTH_WAVEBOX_COMPLETE, actions.authenticationSuccess)
ipcRenderer.on(WB_AUTH_WAVEBOX_ERROR, actions.authenticationFailure)

export default actions
