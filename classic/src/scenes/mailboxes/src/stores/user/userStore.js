import RendererUserStore from 'shared/AltStores/User/RendererUserStore'
import { STORE_NAME } from 'shared/AltStores/User/AltUserIdentifiers'
import alt from '../alt'
import actions from './userActions'
import { WaveboxHTTP } from 'Server'
import { ipcRenderer } from 'electron'
import ParallelHttpTracker from 'shared/AltStores/ParallelHttpTracker'
import TakeoutService from './TakeoutService'
import WaveboxAuthProviders from 'shared/Models/WaveboxAuthProviders'
import accountActions from '../account/accountActions'
import AltAccountIdentifiers from 'shared/AltStores/Account/AltAccountIdentifiers'
import GoogleAuth from 'shared/Models/ACAccounts/Google/GoogleAuth'
import MicrosoftAuth from 'shared/Models/ACAccounts/Microsoft/MicrosoftAuth'

import {
  EXTENSION_AUTO_UPDATE_INTERVAL,
  WIRE_CONFIG_AUTO_UPDATE_INTERVAL,
  USER_PROFILE_SYNC_INTERVAL,
  USER_PROFILE_SYNC_THROTTLE,
  USER_PROFILE_SYNC_RETRY
} from 'shared/constants'
import {
  WB_AUTH_WAVEBOX
} from 'shared/ipcEvents'

class UserStore extends RendererUserStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this.extensionAutoUpdater = null
    this.wireConfigAutoUpdater = null
    this.containerAutoUpdater = null
    this.profileAutoUploader = null
    this.userProfileUpload = new ParallelHttpTracker(ParallelHttpTracker.PARALLEL_MODES.LAST_WINS, 'UploadUserProfile')
    this.userProfilesFetch = new ParallelHttpTracker(ParallelHttpTracker.PARALLEL_MODES.STRICT_SINGLETON, 'FetchUserProfiles')
    this.userProfileUploadAfter = null
    this.userProfileRetryUpload = null

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Extensions
      handleUpdateExtensions: actions.UPDATE_EXTENSIONS,
      handleStartAutoUpdateExtensions: actions.START_AUTO_UPDATE_EXTENSIONS,
      handleStopAutoupdateExtensions: actions.STOP_AUTO_UPDATE_EXTENSIONS,

      // Wire Config
      handleUpdateWireConfig: actions.UPDATE_WIRE_CONFIG,
      handleStartAutoUpdateWireConfig: actions.START_AUTO_UPDATE_WIRE_CONFIG,
      handleStopAutoUpdateWireConfig: actions.STOP_AUTO_UPDATE_WIRE_CONFIG,

      // Containers
      handleSideloadContainerLocally: actions.SIDELOAD_CONTAINER_LOCALLY,
      handleUpdateContainers: actions.UPDATE_CONTAINERS,
      handleStartAutoUpdateContainers: actions.START_AUTO_UPDATE_CONTAINERS,
      handleStopAutoUpdateContainers: actions.STOP_AUTO_UPDATE_CONTAINERS,

      // Auth
      handleAuthenticateWithAuth: actions.AUTHENTICATE_WITH_AUTH,
      handleAuthenticateWithGoogle: actions.AUTHENTICATE_WITH_GOOGLE,
      handleAuthenticateWithMicrosoft: actions.AUTHENTICATE_WITH_MICROSOFT,
      handleAuthenticateWithWavebox: actions.AUTHENTICATE_WITH_WAVEBOX,
      handleAuthenticationSuccess: actions.AUTHENTICATION_SUCCESS,
      handleAuthenticationFailure: actions.AUTHENTICATION_FAILURE,

      // Profile
      handleStartAutoUploadUserProfile: actions.START_AUTO_UPLOAD_USER_PROFILE,
      handleStopAutoUploadUserProfile: actions.STOP_AUTO_UPLOAD_USER_PROFILE,
      handleUploadUserProfile: actions.UPLOAD_USER_PROFILE,
      handleUploadUserProfileAfter: actions.UPLOAD_USER_PROFILE_AFTER,
      handleFetchUserProfiles: actions.FETCH_USER_PROFILES,
      handleRestoreUserProfile: actions.RESTORE_USER_PROFILE
    })
  }

  /* **************************************************************************/
  // Handlers: Extensions
  /* **************************************************************************/

  handleUpdateExtensions () {
    this.preventDefault()

    WaveboxHTTP.fetchExtensionInfo(this.clientId)
      .then((res) => actions.setExtensions(res))
  }

  handleStartAutoUpdateExtensions () {
    actions.updateExtensions.defer()

    if (this.extensionAutoUpdater !== null) {
      this.preventDefault()
      return
    }
    this.extensionAutoUpdater = setInterval(() => {
      actions.updateExtensions()
    }, EXTENSION_AUTO_UPDATE_INTERVAL)
  }

  handleStopAutoupdateExtensions () {
    clearInterval(this.extensionAutoUpdater)
    this.extensionAutoUpdater = null
  }

  /* **************************************************************************/
  // Handlers: Wire Config
  /* **************************************************************************/

  handleUpdateWireConfig () {
    this.preventDefault()

    WaveboxHTTP.fetchWireConfig(this.clientId)
      .then((res) => actions.setWireConfig(res))
  }

  handleStartAutoUpdateWireConfig () {
    actions.updateWireConfig.defer()

    if (this.wireConfigAutoUpdater !== null) {
      this.preventDefault()
      return
    }
    this.wireConfigAutoUpdater = setInterval(() => {
      actions.updateWireConfig()
    }, WIRE_CONFIG_AUTO_UPDATE_INTERVAL)
  }

  handleStopAutoUpdateWireConfig () {
    clearInterval(this.wireConfigAutoUpdater)
    this.wireConfigAutoUpdater = null
  }

  /* **************************************************************************/
  // Handlers: Containers
  /* **************************************************************************/

  handleSideloadContainerLocally ({ id, data }) {
    super.handleAddContainers({
      containers: { [id]: data }
    })
  }

  handleAddContainers (payload) {
    const updated = super.handleAddContainers(payload)
    if (Object.keys(updated).length) {
      accountActions.containersUpdated.defer(Object.keys(updated))
    }
    return updated
  }

  handleUpdateContainers () {
    this.preventDefault()

    // Get the containers we're actively syncing
    const containerManifest = Array.from(this.containers.values())
      .reduce((acc, container) => {
        acc[container.id] = container.version
        return acc
      }, {})

    // Find any mailboxes that aren't being synced right now. This can sometimes happen
    // if the user has imported their data/profile
    const accountStore = this.alt.getStore(AltAccountIdentifiers.STORE_NAME)
    if (!accountStore) {
      throw new Error(`Alt "${STORE_NAME}" unable to locate "${AltAccountIdentifiers.STORE_NAME}". Ensure both have been linked`)
    }
    accountStore.getState().allContainerIds().forEach((containerId) => {
      if (containerManifest[containerId] === undefined) {
        containerManifest[containerId] = -1
      }
    })

    // Send the request off
    if (Object.keys(containerManifest).length === 0) { return }
    WaveboxHTTP.fetchContainerUpdates(this.clientId, containerManifest)
      .then((res) => {
        if (res.containers && Object.keys(res.containers).length) {
          actions.addContainers(res.containers)
        }
      })
  }

  handleStartAutoUpdateContainers () {
    actions.updateContainers.defer()

    if (this.containerAutoUpdater !== null) {
      this.preventDefault()
      return
    }
    this.containerAutoUpdater = setInterval(() => {
      actions.updateContainers()
    }, WIRE_CONFIG_AUTO_UPDATE_INTERVAL)
  }

  handleStopAutoUpdateContainers () {
    clearInterval(this.containerAutoUpdater)
    this.containerAutoUpdater = null
  }

  /* **************************************************************************/
  // Handlers: Auth
  /* **************************************************************************/

  handleAuthenticateWithAuth ({ partitionId, namespace, serverArgs, openAccountOnSuccess }) {
    this.preventDefault()
    let providerType
    if (namespace === GoogleAuth.namespace) {
      providerType = WaveboxAuthProviders.GOOGLE
    } else if (namespace === MicrosoftAuth.namespace) {
      providerType = WaveboxAuthProviders.MICROSOFT
    }
    if (!providerType) { return }

    ipcRenderer.send(WB_AUTH_WAVEBOX, {
      partitionId: partitionId,
      type: providerType,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithGoogle ({ serverArgs, openAccountOnSuccess }) {
    this.preventDefault()
    ipcRenderer.send(WB_AUTH_WAVEBOX, {
      partitionId: null,
      type: WaveboxAuthProviders.GOOGLE,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithMicrosoft ({ serverArgs, openAccountOnSuccess }) {
    this.preventDefault()
    ipcRenderer.send(WB_AUTH_WAVEBOX, {
      partitionId: null,
      type: WaveboxAuthProviders.MICROSOFT,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    })
    window.location.hash = '/account/authenticating'
  }

  handleAuthenticateWithWavebox ({ serverArgs, openAccountOnSuccess }) {
    this.preventDefault()
    ipcRenderer.send(WB_AUTH_WAVEBOX, {
      partitionId: null,
      type: WaveboxAuthProviders.WAVEBOX,
      clientSecret: this.user.clientSecret,
      serverArgs: serverArgs,
      openAccountOnSuccess: openAccountOnSuccess
    })
    window.location.hash = '/account/authenticating'
  }

  /* **************************************************************************/
  // Handlers: Auth Callbacks
  /* **************************************************************************/

  handleAuthenticationSuccess ({ next, openAccountOnSuccess }) {
    if (openAccountOnSuccess) {
      if (next) {
        window.location.hash = `/account/view?url=${encodeURIComponent(next)}`
      } else {
        window.location.hash = '/account/view'
      }
    } else {
      window.location.hash = '/'
    }
  }

  handleAuthenticationFailure ({ evt, data }) {
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      /* user cancelled. no-op */
    } else {
      console.error('[AUTH ERR]', data)
    }
  }

  /* **************************************************************************/
  // Handlers: Profiles
  /* **************************************************************************/

  handleStartAutoUploadUserProfile () {
    actions.uploadUserProfile.defer()

    if (this.profileAutoUploader !== null) {
      this.preventDefault()
      return
    }

    this.profileAutoUploader = setInterval(() => {
      actions.uploadUserProfile.defer()
    }, USER_PROFILE_SYNC_INTERVAL)
  }

  handleStopAutoUploadUserProfile () {
    clearInterval(this.profileAutoUploader)
    this.profileAutoUploader = null
  }

  handleUploadUserProfile ({ force }) {
    if (!this.user.enableProfileSync) { this.preventDefault(); return }
    if (force === false) {
      const cancel = this.userProfileUpload.inflight ||
        new Date().getTime() - this.userProfileUpload.timestamp < USER_PROFILE_SYNC_THROTTLE

      if (cancel) {
        this.preventDefault()
        clearTimeout(this.userProfileRetryUpload)
        this.userProfileRetryUpload = setTimeout(() => {
          actions.uploadUserProfile.defer()
        }, USER_PROFILE_SYNC_RETRY)
        return
      }
    }
    clearTimeout(this.userProfileRetryUpload)

    const trackingId = this.userProfileUpload.startRequest()
    Promise.resolve()
      .then(() => TakeoutService.exportDataForServer())
      .then((profile) => WaveboxHTTP.sendUserProfile(this.clientId, this.clientToken, profile))
      .then((res) => {
        if (res.changeset) {
          return Promise.resolve()
            .then(() => TakeoutService.exportDataChangesetForServer(res.changeset))
            .then((data) => WaveboxHTTP.sendUserProfileChangeset(this.clientId, this.clientToken, data))
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        this.userProfileUpload.finishRequestSuccess(trackingId, {})
        this.emitChange()
      })
      .catch((err) => {
        this.userProfileUpload.finishRequestError(trackingId, err.status)
        this.emitChange()
      })
  }

  handleUploadUserProfileAfter ({ wait }) {
    this.preventDefault()

    clearTimeout(this.uploadUserProfileAfter)
    this.uploadUserProfileAfter = setTimeout(() => {
      actions.uploadUserProfile.defer()
    }, wait)
  }

  handleFetchUserProfiles ({ loadingHash, successHash, failureHash }) {
    if (!this.user.enableProfileSync) { this.preventDefault(); return }

    if (loadingHash) { window.location.hash = loadingHash }
    this.userProfilesFetch.metadata = { successHash, failureHash }

    if (this.userProfilesFetch.inflight) {
      this.preventDefault()
      return
    }

    const trackingId = this.userProfilesFetch.startRequest()
    Promise.resolve()
      .then(() => WaveboxHTTP.fetchUserProfiles(this.clientId, this.clientToken))
      .then((res) => {
        this.userProfilesFetch.finishRequestSuccess(trackingId, res)
        this.emitChange()

        if ((this.userProfilesFetch.metadata || {}).successHash) {
          window.location.hash = this.userProfilesFetch.metadata.successHash
        }
      })
      .catch((err) => {
        this.userProfilesFetch.finishRequestError(trackingId, err.status)
        this.emitChange()

        if ((this.userProfilesFetch.metadata || {}).failureHash) {
          window.location.hash = this.userProfilesFetch.metadata.failureHash
        }
      })
  }

  handleRestoreUserProfile ({ profileId }) {
    window.location.hash = '/profile/restore_restarting'
    Promise.resolve()
      .then(() => WaveboxHTTP.fetchFullUserProfile(this.clientId, this.clientToken, profileId))
      .then((data) => {
        // When the restore happens it looks like the app has chrashed because we
        // restart without informing the user. Add an artificial delay which gives
        // the user time to read the restore_restarting scene if they wish
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(data)
          }, 1000)
        })
      })
      .then((data) => {
        TakeoutService.restoreDataFromServer(data)
      })
      .catch((ex) => {
        window.location.hash = ''
      })
  }
}

export default alt.createStore(UserStore, STORE_NAME)
