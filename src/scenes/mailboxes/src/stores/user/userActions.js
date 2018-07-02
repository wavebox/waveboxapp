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
  * @param partitionId: the id of the partitionId
  * @param namespace: the auth namespace
  * @param serverArgs={}: an args dict to pass to the server
  * @param openAccountOnSuccess=true: true to open the account screen on complete
  */
  authenticateWithAuth (partitionId, namespace, serverArgs = {}, openAccountOnSuccess = true) {
    return {
      partitionId: partitionId,
      namespace: namespace,
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    }
  }

  /**
  * Starts the auth process a google account
  * @param serverArgs={}: an args dict to pass to the server
  * @param openAccountOnSuccess=true: true to open the account screen on complete
  */
  authenticateWithGoogle (serverArgs = {}, openAccountOnSuccess = true) {
    return {
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    }
  }

  /**
  * Starts the auth process a microsoft account
  * @param serverArgs={}: an args dict to pass to the server
  * @param openAccountOnSuccess=true: true to open the account screen on complete
  */
  authenticateWithMicrosoft (serverArgs = {}, openAccountOnSuccess = true) {
    return {
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    }
  }

  /**
  * Starts the auth process a wavebox account
  * @param serverArgs={}: an args dict to pass to the server
  * @param openAccountOnSuccess=true: true to open the account screen on complete
  */
  authenticateWithWavebox (serverArgs = {}, openAccountOnSuccess = true) {
    return {
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    }
  }

  /**
  * Opens the create wavebox account
  * @param serverArgs={}: an args dict to pass to the server
  * @param openAccountOnSuccess=true: true to open the account screen on complete
  */
  createWaveboxAccount (serverArgs = {}, openAccountOnSuccess = true) {
    return this.authenticateWithWavebox({
      ...serverArgs,
      start: 'create'
    }, openAccountOnSuccess)
  }

  /**
  * Opens the password reset wavebox account
  * @param serverArgs={}: an args dict to pass to the server
  * @param openAccountOnSuccess=true: true to open the account screen on complete
  */
  passwordResetWaveboxAccount (serverArgs = {}, openAccountOnSuccess = true) {
    return this.authenticateWithWavebox({
      ...serverArgs,
      start: 'password_reset'
    }, openAccountOnSuccess)
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
    return { next: data.next }
  }

  /**
  * Handles an authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  authenticationFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  /**
  * Starts auto uploading the user profile so it stays in sync
  */
  startAutoUploadUserProfile () { return {} }

  /**
  * Stops auto uploading the user profile so it stays in sync
  */
  stopAutoUploadUserProfile () { return {} }

  /**
  * Uploads the user profile
  */
  uploadUserProfile () { return {} }

  /**
  * Uploads the user profile after a certain wait
  * @param wait: the time to wait before uploading
  */
  uploadUserProfileAfter (wait) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.uploadUserProfile())
      }, wait)
    })
  }

  /**
  * Fetches the user profiles
  * @param loadingHash='/proile/fetching_profiles':  the hash path to show on load
  * @param successHash=/profile/restore: the hash path to load on success
  * @param failureHash='/': the hash path to load on failure
  */
  fetchUserProfiles (loadingHash = '/profile/fetching_profiles', successHash = '/profile/restore', failureHash = '/') {
    return {
      loadingHash,
      successHash,
      failureHash
    }
  }

  /**
  * Restores a user profile
  * @param profileId: the id of profile to restore
  */
  restoreUserProfile (profileId) {
    return { profileId }
  }
}

const actions = alt.createActions(UserActions)

// Auth
ipcRenderer.on(WB_AUTH_WAVEBOX_COMPLETE, actions.authenticationSuccess)
ipcRenderer.on(WB_AUTH_WAVEBOX_ERROR, actions.authenticationFailure)

export default actions
