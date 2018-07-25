import CoreAccountStore from 'shared/AltStores/Account/CoreAccountStore'
import alt from '../alt'
import { webContents, session } from 'electron'
import { STORE_NAME } from 'shared/AltStores/Account/AltAccountIdentifiers'
import actions from './accountActions'
import mailboxPersistence from 'Storage/acmailboxStorage'
import mailboxAuthPersistence from 'Storage/acmailboxauthStorage'
import servicePersistence from 'Storage/acserviceStorage'
import servicedataPersistence from 'Storage/acservicedataStorage'
import avatarPersistence from 'Storage/avatarStorage'
import { AccountSessionManager } from 'SessionManager'
import MailboxesWindow from 'Windows/MailboxesWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'
import uuid from 'uuid'
import {
  PERSISTENCE_INDEX_KEY,
  MAILBOX_SLEEP_EXTEND,
  AVATAR_TIMESTAMP_PREFIX,
  MAILBOX_INTELLI_ACTIVE_MAX_TS
} from 'shared/constants'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import CoreACAuth from 'shared/Models/ACAccounts/CoreACAuth'
import ServiceFactory from 'shared/Models/ACAccounts/ServiceFactory'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import ServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/ServiceDataReducer'
import AuthFactory from 'shared/Models/ACAccounts/AuthFactory'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

class AccountStore extends CoreAccountStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this._sleepingQueue_ = new Map()
    this._serviceLastActiveTS_ = new Map()

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
      // Mailbox
      handleCreateMailbox: actions.CREATE_MAILBOX,
      handleRemoveMailbox: actions.REMOVE_MAILBOX,
      handleReduceMailbox: actions.REDUCE_MAILBOX,
      handleSetCustomAvatarOnMailbox: actions.SET_CUSTOM_AVATAR_ON_MAILBOX,

      // Auth
      handleCreateAuth: actions.CREATE_AUTH,
      handleReduceAuth: actions.REDUCE_AUTH,
      handleRemoveAuth: actions.REMOVE_AUTH,

      // Service
      handleCreateService: actions.CREATE_SERVICE,
      handleRemoveService: actions.REMOVE_SERVICE,
      handleMoveServiceToNewMailbox: actions.MOVE_SERVICE_TO_NEW_MAILBOX,
      handleReduceService: actions.REDUCE_SERVICE,
      handleReduceServiceIfActive: actions.REDUCE_SERVICE_IF_ACTIVE,
      handleReduceServiceIfInActive: actions.REDUCE_SERVICE_IF_INACTIVE,
      handleReduceServiceData: actions.REDUCE_SERVICE_DATA,
      handleReduceServiceDataIfActive: actions.REDUCE_SERVICE_DATA_IF_ACTIVE,
      handleReduceServiceDataIfInactive: actions.REDUCE_SERVICE_DATA_IF_INACTIVE,
      handleSetCustomAvatarOnService: actions.SET_CUSTOM_AVATAR_ON_SERVICE,
      handleSetServiceAvatarOnService: actions.SET_SERVICE_AVATAR_ON_SERVICE,
      handleChangeServiceSandboxing: actions.CHANGE_SERVICE_SANDBOXING,

      // Containers
      handleContainersUpdated: actions.CONTAINERS_UPDATED,

      // Sleep
      handleSleepService: actions.SLEEP_SERVICE,
      handleSleepAllServicesInMailbox: actions.SLEEP_ALL_SERVICES_IN_MAILBOX,
      handleAwakenService: actions.AWAKEN_SERVICE,

      // Active
      handleChangeActiveMailbox: actions.CHANGE_ACTIVE_MAILBOX,
      handleChangeActiveMailboxIndex: actions.CHANGE_ACTIVE_MAILBOX_INDEX,
      handleChangeActiveMailboxToPrev: actions.CHANGE_ACTIVE_MAILBOX_TO_PREV,
      handleChangeActiveMailboxToNext: actions.CHANGE_ACTIVE_MAILBOX_TO_NEXT,
      handleChangeActiveService: actions.CHANGE_ACTIVE_SERVICE,
      handleChangeActiveServiceIndex: actions.CHANGE_ACTIVE_SERVICE_INDEX,
      handleChangeActiveServiceToPrev: actions.CHANGE_ACTIVE_SERVICE_TO_PREV,
      handleChangeActiveServiceToNext: actions.CHANGE_ACTIVE_SERVICE_TO_NEXT,
      handleChangeActiveTabToNext: actions.CHANGE_ACTIVE_TAB_TO_NEXT,
      handleChangeActiveTabToPrev: actions.CHANGE_ACTIVE_TAB_TO_PREV,

      // Mailbox auth teardown
      handleClearMailboxBrowserSession: actions.CLEAR_MAILBOX_BROWSER_SESSION,
      handleClearAllBrowserSessions: actions.CLEAR_ALL_BROWSER_SESSIONS
    })
  }

  /* **************************************************************************/
  // Remote
  /* **************************************************************************/

  /**
  * Overwrite
  */
  _remoteConnectReturnValue () {
    return {
      mailboxIndex: this._mailboxIndex_,
      mailboxes: Array.from(this._mailboxes_.keys()).reduce((acc, id) => {
        acc[id] = this._mailboxes_.get(id).cloneData()
        return acc
      }, {}),
      activeService: this._activeServiceId_,
      services: Array.from(this._services_.keys()).reduce((acc, id) => {
        acc[id] = this._services_.get(id).cloneData()
        return acc
      }, {}),
      serviceData: Array.from(this._serviceData_.keys()).reduce((acc, id) => {
        acc[id] = this._serviceData_.get(id).cloneData()
        return acc
      }, {}),
      mailboxAuth: Array.from(this._mailboxAuth_.keys()).reduce((acc, id) => {
        acc[id] = this._mailboxAuth_.get(id).cloneData()
        return acc
      }, {}),
      sleepingServices: Array.from(this._sleepingServices_.keys()).reduce((acc, k) => {
        acc[k] = this._sleepingServices_.get(k)
        return acc
      }, {}),
      avatars: Array.from(this._avatars_.keys()).reduce((acc, k) => {
        acc[k] = this._avatars_.get(k)
        return acc
      }, {})
    }
  }

  /* **************************************************************************/
  // Saving
  /* **************************************************************************/

  /**
  * Saves a local mailbox ensuring changed time etc update accordingly and data sent up socket
  * @param id: the id of the provider
  * @param mailboxJS: the new js object for the mailbox or null to remove
  * @return the generated model
  */
  saveMailbox (id, mailboxJS) {
    const prevMailbox = this.getMailbox(id)
    if (mailboxJS === null) {
      if (!prevMailbox) { return undefined }

      mailboxPersistence.removeItem(id)
      this._mailboxes_.delete(id)
      this.dispatchToRemote('remoteSetMailbox', [id, null])

      AccountSessionManager.stopManagingMailbox(prevMailbox)
      return undefined
    } else {
      mailboxJS.changedTime = new Date().getTime()
      mailboxJS.id = id
      const model = new ACMailbox(mailboxJS)
      mailboxPersistence.setJSONItem(id, mailboxJS)
      this._mailboxes_.set(id, model)
      this.dispatchToRemote('remoteSetMailbox', [id, mailboxJS])
      return model
    }
  }

  /**
  * Persist the provided index
  * @param index: the index to persist
  */
  saveMailboxIndex (index) {
    this._mailboxIndex_ = index
    mailboxPersistence.setJSONItem(PERSISTENCE_INDEX_KEY, index)
    this.dispatchToRemote('remoteSetMailboxIndex', [index])
  }

  /**
  * Saves a local mailbox auth ensuring changed time etc update accordingly and data sent up socket
  * @param id: the id of the provider
  * @param mailboxAuthJS: the new js object for the mailbox or null to remove
  * @return the generated model
  */
  saveMailboxAuth (id, mailboxAuthJS) {
    if (mailboxAuthJS === null) {
      mailboxAuthPersistence.removeItem(id)
      this._mailboxAuth_.delete(id)
      this.dispatchToRemote('remoteSetMailboxAuth', [id, null])
      return undefined
    } else {
      mailboxAuthJS.changedTime = new Date().getTime()
      mailboxAuthJS.id = id
      const model = AuthFactory.modelizeAuth(mailboxAuthJS)
      mailboxAuthPersistence.setJSONItem(id, mailboxAuthJS)
      this._mailboxAuth_.set(id, model)
      this.dispatchToRemote('remoteSetMailboxAuth', [id, mailboxAuthJS])
      return model
    }
  }

  /**
  * Saves a local service ensuring changed time etc update accordingly and data sent up socket
  * @param id: the id of the provider
  * @param serviceJS: the new js object for the service or null to remove
  * @return the generated model
  */
  saveService (id, serviceJS) {
    const prevService = this.getService(id)
    if (serviceJS === null) {
      if (!prevService) { return }

      servicePersistence.removeItem(id)
      this._services_.delete(id)
      this.dispatchToRemote('remoteSetService', [id, null])

      AccountSessionManager.stopManagingService(prevService)

      return undefined
    } else {
      serviceJS.changedTime = new Date().getTime()
      serviceJS.id = id
      const model = ServiceFactory.modelizeService(serviceJS)
      servicePersistence.setJSONItem(id, serviceJS)
      this._services_.set(id, model)
      this.dispatchToRemote('remoteSetService', [id, serviceJS])
      return model
    }
  }

  /**
  * Saves a local service data ensuring changed time etc update accordingly and data sent up socket
  * @param id: the id of the provider
  * @param serviceDataJS: the new js object for the mailbox or null to remove
  * @return the generated model
  */
  saveServiceData (id, serviceDataJS) {
    if (serviceDataJS === null) {
      servicedataPersistence.removeItem(id)
      this._serviceData_.delete(id)
      this.dispatchToRemote('remoteSetServiceData', [id, null])
      return undefined
    } else {
      serviceDataJS.changedTime = new Date().getTime()
      serviceDataJS.id = id
      const model = ServiceFactory.modelizeServiceData(serviceDataJS)
      servicedataPersistence.setJSONItem(id, serviceDataJS)
      this._serviceData_.set(id, model)
      this.dispatchToRemote('remoteSetServiceData', [id, serviceDataJS])
      return model
    }
  }

  /**
  * Saves the active items
  * @param serviceId: the id of the service to change to
  */
  saveActiveServiceId (serviceId) {
    if (serviceId !== this._activeServiceId_) {
      this._serviceLastActiveTS_.set(this.activeServiceId(), new Date().getTime())
      this._activeServiceId_ = serviceId
      this.dispatchToRemote('remoteSetActiveService', [serviceId])
      if (serviceId) {
        actions.reduceServiceData.defer(serviceId, ServiceDataReducer.mergeChangesetOnActive)
      }
    }
  }

  /**
  * Saves an avatar
  * @param id: the id of the avatar
  * @param b64Image: the image or undefined/null
  */
  saveAvatar (id, b64Image) {
    if (b64Image) {
      if (this._avatars_.get(id) === b64Image) { return }
      this._avatars_.set(id, b64Image)
      avatarPersistence.setItem(id, b64Image)
      avatarPersistence.setItem(`${AVATAR_TIMESTAMP_PREFIX}${id}`, new Date().getTime())
      this.dispatchToRemote('remoteSetAvatar', [id, b64Image])
    } else {
      if (!this._avatars_.has(id)) { return }
      this._avatars_.delete(id)
      avatarPersistence.removeItem(id)
      avatarPersistence.removeItem(`${AVATAR_TIMESTAMP_PREFIX}${id}`)
      this.dispatchToRemote('remoteSetAvatar', [id, null])
    }
  }

  /* **************************************************************************/
  // Management
  /* **************************************************************************/

  /**
  * Starts managing a mailbox
  * @param mailboxId: the id of the mailbox
  */
  startManagingMailboxWithId (mailboxId) {
    AccountSessionManager.startManagingMailbox(this.getMailbox(mailboxId))
  }

  /**
  * Starts managing a service
  * @param serviceId: the id of the service
  */
  startManagingServiceWithId (serviceId) {
    const service = this.getService(serviceId)
    const mailbox = this.getMailbox(service ? service.parentId : undefined)
    AccountSessionManager.startManagingService(mailbox, service)
  }

  /* **************************************************************************/
  // Load
  /* **************************************************************************/

  handleLoad (payload) {
    super.handleLoad(payload)

    this.mailboxIds().forEach((mailboxId) => {
      this.startManagingMailboxWithId(mailboxId)
    })
    this.serviceIds().forEach((serviceId) => {
      this.startManagingServiceWithId(serviceId)
    })
  }

  /* **************************************************************************/
  // Mailboxes
  /* **************************************************************************/

  handleCreateMailbox ({ data }) {
    if (this._mailboxes_.has(data.id)) { this.preventDefault(); return }

    this.saveMailbox(data.id, data)
    this.saveMailboxIndex(this._mailboxIndex_.concat(data.id))
    this.startManagingMailboxWithId(data.id)
  }

  handleRemoveMailbox ({ id }) {
    const mailbox = this.getMailbox(id)
    if (mailbox) {
      const wasActive = this.activeMailboxId() === id
      // There's a waterfall of assets to remove when removing the mailbox
      const serviceIds = mailbox.allServices
      const authIds = this.getMailboxAuthIdsForMailbox(id)

      this.saveMailboxIndex(this._mailboxIndex_.filter((i) => i !== id))
      this.saveMailbox(id, null)
      serviceIds.forEach((id) => {
        this.saveService(id, null)
        this.saveServiceData(id, null)
      })
      authIds.forEach((id) => {
        this.saveMailboxAuth(id, null)
      })

      if (wasActive) {
        const nextServiceId = this.firstServiceId()
        if (nextServiceId) {
          this.clearServiceSleep(nextServiceId)
          this.saveActiveServiceId(nextServiceId)
        } else {
          this.saveActiveServiceId(null)
        }
      }
    } else {
      this.preventDefault()
    }
  }

  handleChangeMailboxIndex (payload) {
    const next = super.handleChangeMailboxIndex(payload)
    this.saveMailboxIndex(next)
    return next
  }

  handleReduceMailbox ({ id = this.activeMailboxId(), reducer, reducerArgs }) {
    const mailbox = this.getMailbox(id)
    if (mailbox) {
      const nextJS = reducer(...[mailbox].concat(reducerArgs))
      if (nextJS) {
        this.saveMailbox(id, nextJS)
        return
      }
    }

    this.preventDefault()
  }

  handleSetCustomAvatarOnMailbox ({id, b64Image}) {
    const mailbox = this.getMailbox(id)
    if (!mailbox) { this.preventDefault(); return }

    const prevAvatarId = mailbox.avatarId
    if (b64Image) { // Set
      if (prevAvatarId && this._avatars_.get(prevAvatarId) === b64Image) {
        this.preventDefault(); return
      }

      const avatarId = uuid.v4()
      this.saveAvatar(avatarId, b64Image)
      this.saveMailbox(id, mailbox.changeData({ avatarId: avatarId }))
      if (prevAvatarId) {
        this.saveAvatar(prevAvatarId, null)
      }
    } else { // Remove
      if (!prevAvatarId) { this.preventDefault(); return }
      this.saveMailbox(id, mailbox.changeData({ avatarId: undefined }))
      this.saveAvatar(prevAvatarId, null)
    }
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  handleCreateAuth ({ data }) {
    this.saveMailboxAuth(
      CoreACAuth.compositeId(data.parentId, data.namespace, data.sandboxedPartitionId),
      data
    )
  }

  handleReduceAuth ({ id, reducer, reducerArgs }) {
    const auth = this.getMailboxAuth(id)
    if (auth) {
      const nextJS = reducer(...[auth].concat(reducerArgs))
      if (nextJS) {
        this.saveMailboxAuth(id, nextJS)
        return
      }
    }

    this.preventDefault()
  }

  handleRemoveAuth ({ id }) {
    this.saveMailboxAuth(id, null)
  }

  /* **************************************************************************/
  // Service
  /* **************************************************************************/

  handleCreateService ({ parentId, parentLocation, data }) {
    if (this._services_.has(data.id)) { this.preventDefault(); return }

    const mailbox = this.getMailbox(parentId)
    if (!mailbox) { this.preventDefault(); return }
    if (mailbox.hasServiceWithId(data.id)) { this.preventDefault(); return }

    // Create the service data
    const serviceDataJS = ServiceFactory.serviceDataClass(data.type).createJS(data.id, data.type)
    this.saveServiceData(data.id, serviceDataJS)

    // Save the service
    this.saveService(data.id, data)

    // Update the mailbox
    const nextMailboxJS = MailboxReducer.addServiceByLocation(...[mailbox].concat([data.id, parentLocation]))
    if (nextMailboxJS) {
      this.saveMailbox(parentId, nextMailboxJS)
    }

    this.startManagingServiceWithId(data.id)
  }

  handleRemoveService ({ id }) {
    const service = this.getService(id)
    if (!service) { this.preventDefault(); return }
    const wasActive = this.activeServiceId() === id

    // Remove from the mailbox
    const mailbox = this.getMailbox(service.parentId)
    let nextMailbox
    if (mailbox) {
      const nextMailboxJS = MailboxReducer.removeService(...[mailbox].concat([id]))
      if (nextMailboxJS) {
        nextMailbox = this.saveMailbox(mailbox.id, nextMailboxJS)
      }
    }

    if (service.sandboxFromMailbox) {
      // Cleanup any sandboxed auth
      this.saveMailboxAuth(CoreACAuth.compositeId(
        service.parentId,
        service.supportedAuthNamespace,
        service.partitionId
      ), null)
    }

    // Remove the service
    this.saveService(id, null)
    this.saveServiceData(id, null)

    if (wasActive) {
      const nextServiceId = ((nextMailbox || {}).allServices || [])[0] || this.firstServiceId()
      if (nextServiceId) {
        this.clearServiceSleep(nextServiceId)
        this.saveActiveServiceId(nextServiceId)
      } else {
        this.saveActiveServiceId(null)
      }
    }
  }

  handleMoveServiceToNewMailbox ({ id }) {
    const service = this.getService(id)
    if (!service) { this.preventDefault(); return }
    const prevMailboxId = service.parentId
    const nextMailboxId = uuid.v4()

    // Notes on this. Auth is lost (mailbox owns). Service data will be
    // automigrated (parentId is serviceId)

    // 1. Remove from the current mailbox
    const sourceMailbox = this.getMailbox(prevMailboxId)
    if (sourceMailbox) {
      const nextSourceMailboxJS = MailboxReducer.removeService(
        ...[sourceMailbox].concat([id])
      )
      if (nextSourceMailboxJS) {
        this.saveMailbox(prevMailboxId, nextSourceMailboxJS)
      }
    }

    // 2. Create the new mailbox
    const targetMailboxJS1 = ACMailbox.createJS(
      nextMailboxId,
      undefined,
      undefined,
      undefined
    )
    const targetMailbox1 = this.saveMailbox(nextMailboxId, targetMailboxJS1)
    this.saveMailboxIndex(this._mailboxIndex_.concat(nextMailboxId))

    // 3. Update the service
    this.saveService(id, {
      ...service.cloneData(),
      parentId: nextMailboxId
    })

    // 4. Attach service to mailbox
    const targetMailboxJS2 = MailboxReducer.addServiceByLocation(
      ...[targetMailbox1].concat([id, ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START])
    )
    this.saveMailbox(nextMailboxId, targetMailboxJS2)

    // Manage everyone
    this.startManagingMailboxWithId(nextMailboxId)
    this.startManagingServiceWithId(id)
  }

  handleReduceService ({ id = this.activeServiceId(), reducer, reducerArgs }) {
    const service = this.getService(id)
    if (service) {
      const nextJS = reducer(...[service].concat(reducerArgs))
      if (nextJS) {
        this.saveService(id, nextJS)
        return
      }
    }

    this.preventDefault()
  }

  handleReduceServiceIfActive ({ id, reducer, reducerArgs }) {
    this.preventDefault()
    if (this.activeServiceId() === id) {
      actions.reduceService.defer(...[id, reducer, ...reducerArgs])
    }
  }

  handleReduceServiceIfInactive ({ id, reducer, reducerArgs }) {
    this.preventDefault()

    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const isMailboxesWindowFocused = mailboxesWindow && mailboxesWindow.isFocused()
    if (this.activeServiceId() !== id || !isMailboxesWindowFocused) {
      actions.reduceService.defer(...[id, reducer, ...reducerArgs])
    }
  }

  handleReduceServiceData ({ id = this.activeServiceId(), reducer, reducerArgs }) {
    const service = this.getService(id)
    const serviceData = this.getServiceData(id)
    if (service && serviceData) {
      const nextJS = reducer(...[service, serviceData].concat(reducerArgs))
      if (nextJS) {
        this.saveServiceData(id, nextJS)
        return
      }
    }

    this.preventDefault()
  }

  handleReduceServiceDataIfActive ({ id, reducer, reducerArgs }) {
    this.preventDefault()
    if (this.activeServiceId() === id) {
      actions.reduceServiceData.defer(...[id, reducer, ...reducerArgs])
    }
  }

  handleReduceServiceDataIfInactive ({ id, reducer, reducerArgs }) {
    this.preventDefault()

    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const isMailboxesWindowFocused = mailboxesWindow && mailboxesWindow.isFocused()
    if (this.activeServiceId() !== id || !isMailboxesWindowFocused) {
      actions.reduceServiceData.defer(...[id, reducer, ...reducerArgs])
    }
  }

  handleSetCustomAvatarOnService ({id, b64Image}) {
    const service = this.getService(id)
    if (!service) { this.preventDefault(); return }

    const prevAvatarId = service.avatarId
    if (b64Image) { // Set
      if (prevAvatarId && this._avatars_.get(prevAvatarId) === b64Image) {
        this.preventDefault(); return
      }

      const avatarId = uuid.v4()
      this.saveAvatar(avatarId, b64Image)
      this.saveService(id, service.changeData({ avatarId: avatarId }))
      if (prevAvatarId) {
        this.saveAvatar(prevAvatarId, null)
      }
    } else { // Remove
      if (!prevAvatarId) { this.preventDefault(); return }
      this.saveService(id, service.changeData({ avatarId: undefined }))
      this.saveAvatar(prevAvatarId, null)
    }
  }

  handleSetServiceAvatarOnService ({id, b64Image}) {
    const service = this.getService(id)
    if (!service) { this.preventDefault(); return }

    const prevAvatarId = service.serviceLocalAvatarId
    if (b64Image) { // Set
      if (prevAvatarId && this._avatars_.get(prevAvatarId) === b64Image) {
        this.preventDefault(); return
      }

      const avatarId = uuid.v4()
      this.saveAvatar(avatarId, b64Image)
      this.saveService(id, service.changeData({ serviceLocalAvatarId: avatarId }))
      if (prevAvatarId) {
        this.saveAvatar(prevAvatarId, null)
      }
    } else { // Remove
      if (!prevAvatarId) { this.preventDefault(); return }
      this.saveService(id, service.changeData({ serviceLocalAvatarId: undefined }))
      this.saveAvatar(prevAvatarId, null)
    }
  }

  handleChangeServiceSandboxing ({ id, sandbox }) {
    const service = this.getService(id)
    if (!service) { this.preventDefault(); return }
    if (service.sandboxFromMailbox === sandbox) { this.preventDefault(); return }

    if (sandbox) {
      this.saveService(id, service.changeData({
        sandboxFromMailbox: true,
        sandboxedPartitionId: uuid.v4()
      }))
      this.startManagingServiceWithId(id)
    } else {
      // Cleanup auth
      this.saveMailboxAuth(CoreACAuth.compositeId(
        service.parentId,
        service.supportedAuthNamespace,
        service.partitionId
      ), null)

      // Save the mailbox
      this.saveService(id, service.changeData({
        sandboxFromMailbox: false,
        sandboxedPartitionId: undefined
      }))

      AccountSessionManager.stopManagingService(service)
    }
  }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  handleContainersUpdated ({ containerIds }) {
    if (containerIds.length === 0) { this.preventDefault(); return }
    containerIds = new Set(containerIds)

    // Get the servies that need to be updated
    const services = this.allServicesOfType(SERVICE_TYPES.CONTAINER)
      .filter((service) => containerIds.has(service.containerId))
    if (services.length === 0) { this.preventDefault(); return }

    services.forEach((service) => {
      this.saveService(service.id, service.changeData({
        container: this.getContainer(service.containerId).cloneForService()
      }))
    })
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  handleAwakenService ({ id }) {
    if (!this.isServiceSleeping(id)) { this.preventDefault(); return }
    this.clearServiceSleep(id)
  }

  handleSleepService ({ id }) {
    if (this.isServiceSleeping(id)) { this.preventDefault(); return }
    this.sleepService(id)
  }

  handleSleepAllServicesInMailbox ({ id }) {
    const mailbox = this.getMailbox(id)
    if (!mailbox) { this.preventDefault(); return }

    mailbox.allServices.forEach((serviceId) => {
      this.sleepService(serviceId)
    })
  }

  /**
  * Clears sleep for a mailbox and service
  * @param id: the id of the service
  */
  clearServiceSleep (id) {
    // Clear schedule
    clearTimeout(this._sleepingQueue_.get(id) || null)
    this._sleepingQueue_.delete(id)

    // Sleep
    if (this._sleepingServices_.get(id) !== false) {
      this._sleepingServices_.set(id, false)
      this.dispatchToRemote('remoteSetSleep', [id, false])
    }
  }

  /**
  * Schedules a new sleep for a mailbox/service
  * @param id: the id of the service
  */
  scheduleServiceSleep (id) {
    // Clear schedule
    clearTimeout(this._sleepingQueue_.get(id) || null)
    this._sleepingQueue_.delete(id)

    // Grab info
    const service = this.getService(id)
    if (!service) { return }
    if (!service.sleepable) { return }

    // Queue up
    if (service.sleepableTimeout <= 0) {
      this.sleepService(id)
    } else {
      // Reschedule
      const sched = setTimeout(() => {
        this.sleepService(id)
      }, service.sleepableTimeout)
      this._sleepingQueue_.set(id, sched)
    }
  }

  /**
  * Runs the process of sending a mailbox to sleep whilst also checking if it owns any other windows
  * @param id: the id of the service
  * @return true if we did sleep, false otherwise
  */
  sleepService (id) {
    if (this.isServiceSleeping(id)) { return }

    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const openWindowCount = mailboxesWindow ? mailboxesWindow.tabManager.getOpenWindowCount(id) : 0
    if (openWindowCount === 0) {
      // Clear previous
      clearTimeout(this._sleepingQueue_.get(id) || null)
      this._sleepingQueue_.delete(id)

      // Record metrics
      const sleepMetrics = this.generateServiceSleepMetrics(id)
      this._sleepingMetrics_.set(id, sleepMetrics)
      this.dispatchToRemote('remoteSetSleepMetrics', [id, sleepMetrics])

      // Sleep
      this._sleepingServices_.set(id, true)
      this.dispatchToRemote('remoteSetSleep', [id, true])
      return true
    } else {
      // Clear previous
      clearTimeout(this._sleepingQueue_.get(id) || null)
      this._sleepingQueue_.delete(id)

      // Reschedule
      const sched = setTimeout(() => {
        this.sleepService(id)
      }, MAILBOX_SLEEP_EXTEND)
      this._sleepingQueue_.set(id, sched)
      return false
    }
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return the metrics for the web contents or undefined if not found
  */
  generateServiceSleepMetrics (id) {
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    return mailboxesWindow ? mailboxesWindow.tabManager.getServiceMetrics(id) : undefined
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Re-issues a change active mailbox action as a change active service action
  * @param id: the id of the mailbox to change
  * @param firstService: true to force into the first service
  * @return true if it dispatched, false otherwise
  */
  _changeActiveMailboxBySecondaryAction (id, firstService) {
    const mailbox = this.getMailbox(id)
    if (!mailbox) { return false }

    // If we haven't specified we want the first service, look at which service
    // was last active. If we've been active recently then switch to that tab
    // otherwise default to the first service as usual
    if (!firstService) {
      // If the mailbox is already active we probably want the first service
      if (this.activeMailboxId() !== id) {
        const lastAccessedId = mailbox.allServices.reduce((acc, serviceId) => {
          const ts = this._serviceLastActiveTS_.get(serviceId) || 0
          return ts > acc.ts ? { serviceId, ts } : acc
        }, { serviceId: undefined, ts: 0 })

        if (lastAccessedId.serviceId) {
          const now = new Date().getTime()
          if (now - lastAccessedId.ts <= MAILBOX_INTELLI_ACTIVE_MAX_TS) {
            actions.changeActiveService.defer(lastAccessedId.serviceId)
            return true
          }
        }
      }
    }

    // Run the default behaviour of switching back to the first service
    const serviceId = mailbox.allServices[0]
    if (serviceId) {
      actions.changeActiveService.defer(serviceId)
      return true
    } else {
      return false
    }
  }

  handleChangeActiveMailbox ({ id, firstService }) {
    this.preventDefault()
    this._changeActiveMailboxBySecondaryAction(id, firstService)
  }

  handleChangeActiveMailboxIndex ({ index }) {
    this.preventDefault()
    this._changeActiveMailboxBySecondaryAction(this._mailboxIndex_[index], false)
  }

  handleChangeActiveMailboxToPrev ({ allowCycling }) {
    this.preventDefault()

    const activeMailboxId = this.activeMailboxId()
    const activeIndex = this._mailboxIndex_.findIndex((id) => id === activeMailboxId)
    let nextId
    if (allowCycling && activeIndex === 0) {
      nextId = this._mailboxIndex_[this._mailboxIndex_.length - 1] || null
    } else {
      nextId = this._mailboxIndex_[Math.max(0, activeIndex - 1)] || null
    }

    if (nextId) {
      this._changeActiveMailboxBySecondaryAction(nextId, false)
    }
  }

  handleChangeActiveMailboxToNext ({ allowCycling }) {
    this.preventDefault()

    const activeMailboxId = this.activeMailboxId()
    const activeIndex = this._mailboxIndex_.findIndex((id) => id === activeMailboxId)
    let nextId
    if (allowCycling && activeIndex === this._mailboxIndex_.length - 1) {
      nextId = this._mailboxIndex_[0] || null
    } else {
      nextId = this._mailboxIndex_[Math.min(this._mailboxIndex_.length - 1, activeIndex + 1)] || null
    }

    if (nextId) {
      this._changeActiveMailboxBySecondaryAction(nextId, false)
    }
  }

  handleChangeActiveService ({ id }) {
    // Run this check on the raw value in case it's inferred in this.activeServiceId() and we end up with a non-change
    if (this._activeServiceId_ === id) { this.preventDefault(); return }

    if (!this.hasService(id)) { this.preventDefault(); return }

    // Update sleep
    const prevActiveId = this.activeServiceId()
    if (prevActiveId) {
      // Make sure you explicitly glue the current sleep in case sleep was implied previously,
      // this normally happens when the app starts and we don't have an active service
      const isSleeping = this.isServiceSleeping(prevActiveId)
      this._sleepingServices_.set(prevActiveId, isSleeping)
      this.dispatchToRemote('remoteSetSleep', [prevActiveId, isSleeping])

      // Setup sleep for nextime
      this.scheduleServiceSleep(prevActiveId)
    }

    // Change
    this.clearServiceSleep(id)
    this.saveActiveServiceId(id)
  }

  handleChangeActiveServiceIndex ({ index }) {
    this.preventDefault()

    const mailbox = this.activeMailbox()
    if (!mailbox) { return }

    const nextServiceId = mailbox.allServices[index]
    if (!nextServiceId) { return }

    actions.changeActiveService(nextServiceId)
  }

  handleChangeActiveServiceToPrev ({ allowCycling }) {
    this.preventDefault()

    const mailbox = this.activeMailbox()
    if (!mailbox) { return }

    const activeServiceId = this.activeServiceId()
    const activeIndex = mailbox.allServices.findIndex((t) => t === activeServiceId)

    let nextServiceId
    if (allowCycling && activeIndex === 0) {
      nextServiceId = mailbox.allServices[mailbox.allServices.length - 1] || null
    } else {
      nextServiceId = mailbox.allServices[Math.max(0, activeIndex - 1)] || null
    }

    if (nextServiceId) {
      actions.changeActiveService.defer(nextServiceId)
    }
  }

  handleChangeActiveServiceToNext ({ allowCycling }) {
    this.preventDefault()

    const mailbox = this.activeMailbox()
    if (!mailbox) { return }

    const activeServiceId = this.activeServiceId()
    const activeIndex = mailbox.allServices.findIndex((t) => t === activeServiceId)

    let nextServiceId
    if (allowCycling && activeIndex === mailbox.enabledServiceTypes.length - 1) {
      nextServiceId = mailbox.allServices[0] || null
    } else {
      nextServiceId = mailbox.allServices[Math.min(mailbox.allServices.length - 1, activeIndex + 1)] || null
    }

    if (nextServiceId) {
      actions.changeActiveService.defer(nextServiceId)
    }
  }

  handleChangeActiveTabToNext () {
    this.preventDefault()

    const activeServiceId = this.activeServiceId()
    const allServiceIds = this.allServicesOrdered().map((s) => s.id)
    const activeIndex = allServiceIds.findIndex((id) => id === activeServiceId)

    let nextServiceId
    if (activeIndex === allServiceIds.length - 1) {
      nextServiceId = allServiceIds[0] || null
    } else {
      nextServiceId = allServiceIds[Math.min(allServiceIds.length - 1, activeIndex + 1)] || null
    }

    if (nextServiceId) {
      actions.changeActiveService.defer(nextServiceId)
    }
  }

  handleChangeActiveTabToPrev () {
    this.preventDefault()

    const activeServiceId = this.activeServiceId()
    const allServiceIds = this.allServicesOrdered().map((s) => s.id)
    const activeIndex = allServiceIds.findIndex((id) => id === activeServiceId)

    let nextServiceId
    if (activeIndex === 0) {
      nextServiceId = allServiceIds[allServiceIds.length - 1] || null
    } else {
      nextServiceId = allServiceIds[Math.max(0, activeIndex - 1)] || null
    }

    if (nextServiceId) {
      actions.changeActiveService.defer(nextServiceId)
    }
  }

  /* **************************************************************************/
  // Handlers: Auth teardown
  /* **************************************************************************/

  handleClearMailboxBrowserSession ({ id }) {
    this.preventDefault()

    const mailbox = this.getMailbox(id)
    if (!mailbox) { return }
    const partitionIds = this.allPartitionsInMailbox(id)
    const partitionIdSet = new Set(partitionIds)

    Promise.resolve()
      .then(() => {
        return partitionIds.reduce((acc, partitionId) => {
          const ses = session.fromPartition(partitionId)
          return acc
            .then(() => { return new Promise((resolve) => { ses.clearStorageData(resolve) }) })
            .then(() => { return new Promise((resolve) => { ses.clearCache(resolve) }) })
        }, Promise.resolve())
      })
      .then(() => {
        webContents.getAllWebContents().forEach((wc) => {
          if (partitionIdSet.has(wc.getWebPreferences().partition)) {
            wc.reload()
          }
        })
      })
  }

  handleClearAllBrowserSessions () {
    this.preventDefault()
    this.mailboxIds().forEach((mailboxId) => {
      actions.clearMailboxBrowserSession.defer(mailboxId)
    })
  }
}

export default alt.createStore(AccountStore, STORE_NAME)
