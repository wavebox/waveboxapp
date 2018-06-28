import CoreAccountStore from 'shared/AltStores/Account/CoreAccountStore'
import alt from '../alt'
import { session, webContents } from 'electron'
import { STORE_NAME } from 'shared/AltStores/Account/AltAccountIdentifiers'
import actions from './accountActions'
import mailboxPersistence from 'Storage/acmailboxStorage'
import mailboxAuthPersistence from 'Storage/acmailboxauthStorage'
import servicePersistence from 'Storage/acserviceStorage'
import servicedataPersistence from 'Storage/acservicedataStorage'
import avatarPersistence from 'Storage/avatarStorage'
import { MailboxesSessionManager, SessionManager } from 'SessionManager' //TODO check usages in these. Calls from this class pass mailbox
import MailboxesWindow from 'Windows/MailboxesWindow'
import WaveboxWindow from 'Windows/WaveboxWindow'
import uuid from 'uuid'
import {
  PERSISTENCE_INDEX_KEY,
  MAILBOX_SLEEP_EXTEND,
  AVATAR_TIMESTAMP_PREFIX
} from 'shared/constants'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import CoreACAuth from 'shared/Models/ACAccounts/CoreACAuth'
import ServiceFactory from 'shared/Models/ACAccounts/ServiceFactory'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import ServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/ServiceDataReducer'

class AccountStore extends CoreAccountStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this._sleepingQueue_ = new Map()

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

      // Service
      handleCreateService: actions.CREATE_SERVICE,
      handleRemoveService: actions.REMOVE_SERVICE,
      handleReduceService: actions.REDUCE_SERVICE,
      handleReduceServiceIfActive: actions.REDUCE_SERVICE_IF_ACTIVE,
      handleReduceServiceIfInActive: actions.REDUCE_SERVICE_IF_INACTIVE,
      handleReduceServiceData: actions.REDUCE_SERVICE_DATA,
      handleReduceServiceDataIfActive: actions.REDUCE_SERVICE_DATA_IF_ACTIVE,
      handleReduceServiceDataIfInactive: actions.REDUCE_SERVICE_DATA_IF_INACTIVE,
      handleSetCustomAvatarOnService: actions.SET_CUSTOM_AVATAR_ON_SERVICE,

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
    if (mailboxJS === null) {
      mailboxPersistence.removeItem(id)
      this._mailboxes_.delete(id)
      this.dispatchToRemote('remoteSetMailbox', [id, null])

      // Queue this a little bit later as the session is probably still in use
      setTimeout(() => {
        SessionManager.clearSessionFull(`persist:${id}`)
      }, 5000)

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
      const model = new CoreACAuth(mailboxAuthJS)
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
    if (serviceJS === null) {
      servicePersistence.removeItem(id)
      this._services_.delete(id)
      this.dispatchToRemote('remoteSetService', [id, null])
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
      this._activeServiceId_ = serviceId
      this.dispatchToRemote('remoteSetActiveService', [serviceId])
    }
  }

  /**
  * Saves an avatar
  * @param id: the id of the avatar
  * @param b64Image: the image or undefined/null
  */
  saveAvatar (id, b64Image) {
    if (b64Image) {
      if (this.avatars.get(id) === b64Image) { return }
      this.avatars.set(id, b64Image)
      avatarPersistence.setItem(id, b64Image)
      avatarPersistence.setItem(`${AVATAR_TIMESTAMP_PREFIX}${id}`, new Date().getTime())
      this.dispatchToRemote('remoteSetAvatar', [id, b64Image])
    } else {
      if (!this.avatars.has(id)) { return }
      this.avatars.delete(id)
      avatarPersistence.removeItem(id)
      avatarPersistence.removeItem(`${AVATAR_TIMESTAMP_PREFIX}${id}`)
      this.dispatchToRemote('remoteSetAvatar', [id, null])
    }
  }

  /* **************************************************************************/
  // Load
  /* **************************************************************************/

  handleLoad (payload) {
    super.handleLoad(payload)

    this.allMailboxes().forEach((mailbox) => {
      MailboxesSessionManager.startManagingSession(mailbox)
    })
  }

  /* **************************************************************************/
  // Mailboxes
  /* **************************************************************************/

  handleCreateMailbox ({ data }) {
    if (this._mailboxes_.has(data.id)) { this.preventDefault(); return }

    const mailbox = this.saveMailbox(data.id, data)
    MailboxesSessionManager.startManagingSession(mailbox)
    this.saveMailboxIndex(this._mailboxIndex_.concat(data.id))
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
        this.saveActiveServiceId(null)
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
      CoreACAuth.composeId(data.parentId, data.namespace),
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
  }

  handleRemoveService ({ id }) {
    const service = this.getService(id)
    if (!service) { this.preventDefault(); return }

    // Remove from the mailbox
    const mailbox = this.getMailbox(service.parentId)
    if (mailbox) {
      const nextMailboxJS = MailboxReducer.removeService(...[mailbox].concat([id]))
      if (nextMailboxJS) {
        this.saveMailbox(mailbox.id, nextMailboxJS)
      }
    }

    // Remove the service
    this.saveService(id, null)
    this.saveServiceData(id, null)
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

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  handleContainersUpdated ({ containerIds }) {
    //TODO
    /*if (containerIds.length === 0) {
      this.preventDefault()
      return
    }
    containerIds = new Set(containerIds)

    // Get the mailboxes that need to be updated
    const mailboxes = this.getMailboxesOfType(CoreMailbox.MAILBOX_TYPES.CONTAINER)
      .filter((mailbox) => containerIds.has(mailbox.containerId))
    if (mailboxes.length === 0) {
      this.preventDefault()
      return
    }

    mailboxes.forEach((mailbox) => {
      const nextMailbox = mailbox.changeData({
        container: this.getContainer(mailbox.containerId).cloneForMailbox()
      })
      this.saveMailbox(mailbox.id, nextMailbox)
    })*/
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
    const wait = service ? service.sleepableTimeout : 0

    // Queue up
    if (wait <= 0) {
      this.sleepService(id)
    } else {
      // Reschedule
      const sched = setTimeout(() => {
        this.sleepService(id)
      }, wait)
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
    const openWindowCount = mailboxesWindow ? mailboxesWindow.tabManager.getOpenWindowCount(id) : 0 //TODO I used to accept mailboxId and serviceType
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
    return mailboxesWindow ? mailboxesWindow.tabManager.getServiceMetrics(id) : undefined //TODO I used to accept mailboxId and serviceType
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Re-issues a change active mailbox action as a change active service action
  * @param id: the id of the mailbox to change
  * @return true if it dispatched, false otherwise
  */
  _changeActiveMailboxBySecondaryAction (id) {
    if (this.activeMailboxId() === id) { return false }

    const mailbox = this.getMailbox(id)
    if (!mailbox) { return false }
    const serviceId = mailbox.allServices[0]
    if (!serviceId) { return false }

    actions.changeActiveService.defer(serviceId)
    return true
  }

  handleChangeActiveMailbox ({ id }) {
    this.preventDefault()
    this._changeActiveMailboxBySecondaryAction(id)
  }

  handleChangeActiveMailboxIndex ({ index }) {
    this.preventDefault()
    this._changeActiveMailboxBySecondaryAction(this._mailboxIndex_[index])
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
      this._changeActiveMailboxBySecondaryAction(nextId)
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
      this._changeActiveMailboxBySecondaryAction(nextId)
    }
  }

  handleChangeActiveService ({ id }) {
    if (this.isServiceRestricted(id)) { this.preventDefault(); return }
    if (this.activeServiceId() === id) { this.preventDefault(); return }
    if (!this.hasService(id)) { this.preventDefault(); return }

    // Update sleep
    const prevActiveId = this.activeServiceId()
    if (prevActiveId) {
      // Make sure you explicitly clear sleep in case sleep was implied previously,
      // this normally happens when the app starts and we don't have an active service
      this.clearServiceSleep(prevActiveId)
      this.scheduleServiceSleep(prevActiveId)
    }

    // Change
    this.clearServiceSleep(id)
    this.saveActiveServiceId(id)
    actions.reduceServiceData.defer(id, ServiceDataReducer.mergeChangesetOnActive)
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

    const ses = session.fromPartition(mailbox.partition)
    Promise.resolve()
      .then(() => {
        return new Promise((resolve) => { ses.clearStorageData(resolve) })
      })
      .then(() => {
        return new Promise((resolve) => { ses.clearCache(resolve) })
      })
      .then(() => {
        const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
        if (mailboxesWindow) {
          mailboxesWindow.tabManager.getWebContentIdsForMailbox(id).forEach((wcId) => {
            const wc = webContents.fromId(wcId)
            if (wc) {
              wc.reload()
            }
          })
        }
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
