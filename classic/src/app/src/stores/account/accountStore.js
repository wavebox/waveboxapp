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
import GenericService from 'shared/Models/ACAccounts/Generic/GenericService'
import CoreACService from 'shared/Models/ACAccounts/CoreACService'
import HtmlMetaService from 'HTTP/HtmlMetaService'
import GoogleMailService from 'shared/Models/ACAccounts/Google/GoogleMailService'
import ServicesManager from 'Services'
import IEngine from 'IEngine'

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
      handleCleanMailboxWindowOpenRules: actions.CLEAN_MAILBOX_WINDOW_OPEN_RULES,

      // Auth
      handleCreateAuth: actions.CREATE_AUTH,
      handleReduceAuth: actions.REDUCE_AUTH,
      handleRemoveAuth: actions.REMOVE_AUTH,

      // Service
      handleCreateService: actions.CREATE_SERVICE,
      handleFastCreateWeblinkService: actions.FAST_CREATE_WEBLINK_SERVICE,
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
      handleContainerSAPIUpdated: actions.CONTAINER_SAPIUPDATED,

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
      handleQuickSwitchNextService: actions.QUICK_SWITCH_NEXT_SERVICE,
      handleQuickSwitchPrevService: actions.QUICK_SWITCH_PREV_SERVICE,

      // Mailbox auth teardown
      handleClearMailboxBrowserSession: actions.CLEAR_MAILBOX_BROWSER_SESSION,
      handleClearAllBrowserSessions: actions.CLEAR_ALL_BROWSER_SESSIONS,

      // Recent
      handleAddRecent: actions.ADD_RECENT,
      handleUpdateRecentTitle: actions.UPDATE_RECENT_TITLE,
      handleUpdateRecentFavicons: actions.UPDATE_RECENT_FAVICONS,
      handleFocusRecent: actions.FOCUS_RECENT,

      // Reading queue
      handleAddToReadingQueue: actions.ADD_TO_READING_QUEUE,
      handleRemoveFromReadingQueue: actions.REMOVE_FROM_READING_QUEUE,

      // Google Inbox
      handleConvertGoogleInboxToGmail: actions.CONVERT_GOOGLE_INBOX_TO_GMAIL,

      // Sync
      handleUserRequestsIntegratedServiceSync: actions.USER_REQUESTS_INTEGRATED_SERVICE_SYNC
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
      serviceLastActiveTS: Array.from(this._serviceLastActiveTS_.keys()).reduce((acc, id) => {
        acc[id] = this._serviceLastActiveTS_.get(id)
        return acc
      }, {}),
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
    const prev = this.getService(id)
    if (serviceJS === null) {
      if (!prev) { return }

      servicePersistence.removeItem(id)
      this._services_.delete(id)
      this.dispatchToRemote('remoteSetService', [id, null])

      AccountSessionManager.stopManagingService(prev)

      // Auto-disconnect integrated-engine
      IEngine.disconnectService(id)

      return undefined
    } else {
      serviceJS.changedTime = new Date().getTime()
      serviceJS.id = id
      const next = ServiceFactory.modelizeService(serviceJS)
      servicePersistence.setJSONItem(id, serviceJS)
      this._services_.set(id, next)
      this.dispatchToRemote('remoteSetService', [id, serviceJS])

      // Auto-connect integrated-engine
      if (!prev) {
        IEngine.connectService(next.id, next.iengineAlias)
      }

      return next
    }
  }

  /**
  * Resync's the container service API with the models that are in the stores
  * @return the ids of the containers that were updated
  */
  resyncContainerServiceSAPI () {
    const updatedIds = []
    this.allServicesOfType(SERVICE_TYPES.CONTAINER).forEach((service) => {
      const sapi = this.getContainerSAPI(service.containerId)
      if (!sapi && !service.hasSAPIConfig) { return }

      const sapiHash = sapi ? JSON.stringify(sapi.cloneForService()) : undefined
      const serviceSapiHash = service.hasSAPIConfig ? JSON.stringify(service.containerSAPI.cloneForService()) : undefined
      if (sapiHash !== serviceSapiHash) {
        updatedIds.push(service.id)
        this.saveService(service.id, service.changeData({
          containerSAPI: sapi ? sapi.cloneForService() : undefined
        }))
      }
    })

    return updatedIds
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
      const now = new Date().getTime()
      this._serviceLastActiveTS_.set(this.activeServiceId(), now)
      this._activeServiceId_ = serviceId
      this.dispatchToRemote('remoteSetActiveService', [serviceId, now])
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

    // Version 4.9.0 and older would convert Google Inbox -> Gmail but not the
    // service data which can cause problems. To fix this, double check the integrity
    // of Google_mail services and if the data maps out as google_inbox fix it.
    // This can probably be removed in a future version
    this.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL).forEach((service) => {
      const serviceData = this.getServiceData(service.id)
      if (serviceData && serviceData.parentType === SERVICE_TYPES.GOOGLE_INBOX) {
        this.saveServiceData(serviceData.id, serviceData.changeData({
          parentType: SERVICE_TYPES.GOOGLE_MAIL
        }))
      }
    })

    this.mailboxIds().forEach((mailboxId) => {
      this.startManagingMailboxWithId(mailboxId)
    })
    this.allServicesUnordered().forEach((service) => {
      this.startManagingServiceWithId(service.id)
      IEngine.connectService(service.id, service.iengineAlias)
    })

    this.resyncContainerServiceSAPI()
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

  handleSetCustomAvatarOnMailbox ({ id, b64Image }) {
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

  handleCleanMailboxWindowOpenRules ({ id, customProviderIds }) {
    const mailbox = this.getMailbox(id)
    if (!mailbox) { this.preventDefault(); return }

    const serviceIds = new Set(this.serviceIds())
    const mailboxIds = new Set(this.mailboxIds())
    const providerIds = customProviderIds ? new Set(customProviderIds) : undefined
    let dirty = false

    // User rules
    const cleanedUserRules = mailbox.userWindowOpenRules.filter(({ serviceId, mailboxId, providerId }) => {
      if (mailboxId && !mailboxIds.has(mailboxId)) {
        dirty = true
        return false
      } else if (serviceId && !serviceIds.has(serviceId)) {
        dirty = true
        return false
      } else if (providerId && providerIds && !providerIds.has(providerId)) {
        dirty = true
        return false
      } else {
        return true
      }
    })

    // No match
    let cleanedNoMatchRule
    if (mailbox.userNoMatchWindowOpenRule.mailboxId && !mailboxIds.has(mailbox.userNoMatchWindowOpenRule.mailboxId)) {
      dirty = true
      cleanedNoMatchRule = { mode: ACMailbox.USER_WINDOW_OPEN_MODES.ASK }
    } else if (mailbox.userNoMatchWindowOpenRule.serviceId && !serviceIds.has(mailbox.userNoMatchWindowOpenRule.serviceId)) {
      dirty = true
      cleanedNoMatchRule = { mode: ACMailbox.USER_WINDOW_OPEN_MODES.ASK }
    } else if (mailbox.userNoMatchWindowOpenRule.providerId && providerIds && !providerIds.has(mailbox.userNoMatchWindowOpenRule.providerId)) {
      dirty = true
      cleanedNoMatchRule = { mode: ACMailbox.USER_WINDOW_OPEN_MODES.ASK }
    } else {
      cleanedNoMatchRule = mailbox.userNoMatchWindowOpenRule
    }

    if (dirty) {
      this.saveMailbox(id, mailbox.changeData({
        userWindowOpenRules: cleanedUserRules,
        userNoMatchWindowOpenRule: cleanedNoMatchRule
      }))
    } else {
      this.preventDefault()
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

  handleFastCreateWeblinkService ({ parentId, url, activateOnCreate }) {
    const mailbox = this.getMailbox(parentId)
    if (!mailbox) { this.preventDefault(); return }

    const serviceJS = {
      ...CoreACService.createJS(undefined, parentId, GenericService.type),
      url: url,
      // Change some of the normal defaults as the user wont be prompted to customize as they see fit
      usePageThemeAsColor: true,
      usePageTitleAsDisplayName: true,
      hasNavigationToolbar: true
    }

    actions.createService.defer(
      parentId,
      mailbox.suggestedServiceUILocation,
      serviceJS
    )

    // Lazy hack to ensure the service is created
    setTimeout(() => {
      actions.changeActiveService.defer(serviceJS.id)
    }, 250)
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

  handleSetCustomAvatarOnService ({ id, b64Image }) {
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

  handleSetServiceAvatarOnService ({ id, b64Image }) {
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
        container: this.getContainer(service.containerId).cloneForService(),
        containerSAPI: this.getContainerSAPIDataForService(service.containerId)
      }))
    })
  }

  handleContainerSAPIUpdated () {
    const updated = this.resyncContainerServiceSAPI()
    if (updated.length === 0) {
      this.preventDefault()
    }
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  handleAwakenService ({ id }) {
    if (!this.isServiceSleeping(id)) { this.preventDefault(); return }
    this.clearServiceSleep(id)
  }

  handleSleepService ({ id, ignoreChildrenCheck }) {
    if (this.isServiceSleeping(id)) { this.preventDefault(); return }
    this.sleepService(id, ignoreChildrenCheck)
  }

  handleSleepAllServicesInMailbox ({ id, ignoreChildrenCheck }) {
    const mailbox = this.getMailbox(id)
    if (!mailbox) { this.preventDefault(); return }

    mailbox.allServices.forEach((serviceId) => {
      this.sleepService(serviceId, ignoreChildrenCheck)
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
  * @Param ignoreChildrenCheck=false: set to true to ignore checking for child windows
  * @return true if we did sleep, false otherwise
  */
  sleepService (id, ignoreChildrenCheck = false) {
    if (this.isServiceSleeping(id)) { return }

    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const openWindowCount = mailboxesWindow ? mailboxesWindow.tabManager.getOpenWindowCount(id) : 0
    if (ignoreChildrenCheck === true || openWindowCount === 0) {
      // Clear previous
      clearTimeout(this._sleepingQueue_.get(id) || null)
      this._sleepingQueue_.delete(id)

      // Sleep metrics went async after electron 3. We don't want to hold sleep up to generate
      // the metrics so instead sleep right away and optimistically hope we can generate
      // metrics. Because the webcontents wont sleep immediately due to ipc and
      // generating the last screenshot there will normally be time to do this!
      this._sleepingMetrics_.delete(id)
      this.dispatchToRemote('remoteSetSleepMetrics', [id, null])
      Promise.resolve()
        .then(() => this.generateServiceSleepMetrics(id))
        .then((metrics) => {
          this._sleepingMetrics_.set(id, metrics)
          this.dispatchToRemote('remoteSetSleepMetrics', [id, metrics])
          this.emitChange()
        })
        .catch(() => { /* no-op */ })

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
  * @return a promise with the metrics or undefined if not found
  */
  generateServiceSleepMetrics (id) {
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    if (!mailboxesWindow) { return Promise.resolve(undefined) }

    const pid = mailboxesWindow.tabManager.getWebContentsOSProcessId(id)
    if (pid === undefined) { return Promise.resolve(undefined) }

    return Promise.resolve()
      .then(() => ServicesManager.metricsService.getMetricsForPid(pid))
      .then((metric) => {
        return { ...metric, timestamp: new Date().getTime() }
      })
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
        const lastAccessedId = this.lastAccessedServiceIdInMailbox(mailbox, true)

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
      nextId = this._mailboxIndex_[activeIndex - 1] || null
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
      nextId = this._mailboxIndex_[activeIndex + 1] || null
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
      nextServiceId = mailbox.allServices[activeIndex - 1] || null
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
    if (allowCycling && activeIndex === mailbox.allServices.length - 1) {
      nextServiceId = mailbox.allServices[0] || null
    } else {
      nextServiceId = mailbox.allServices[activeIndex + 1] || null
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
      nextServiceId = allServiceIds[activeIndex + 1] || null
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
      nextServiceId = allServiceIds[activeIndex - 1] || null
    }

    if (nextServiceId) {
      actions.changeActiveService.defer(nextServiceId)
    }
  }

  handleQuickSwitchNextService () {
    this.preventDefault()

    const nextServiceId = this.lastAccessedServiceIds(true)
      .find((serviceId) => serviceId !== this.activeServiceId())

    if (nextServiceId) {
      actions.changeActiveService.defer(nextServiceId)
    }
  }

  handleQuickSwitchPrevService () {
    this.preventDefault()

    const nextServiceId = this.lastAccessedServiceIds(true).reverse()
      .find((serviceId) => serviceId !== this.activeServiceId())

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
        // We're still living in the heap managed by session in the callback. Exceptions here
        // can bring down the entire app, so give ourselves a new heap with setTimeout
        setTimeout(() => {
          webContents.getAllWebContents().forEach((wc) => {
            const prefs = wc.getWebPreferences()
            if (prefs && partitionIdSet.has(prefs.partition)) {
              wc.reload()
            }
          })
        })
      })
  }

  handleClearAllBrowserSessions () {
    this.preventDefault()
    this.mailboxIds().forEach((mailboxId) => {
      actions.clearMailboxBrowserSession.defer(mailboxId)
    })
  }

  /* **************************************************************************/
  // Handlers: Recent
  /* **************************************************************************/

  /**
  * Updates a recent item
  * @param serviceId: the id of the service
  * @param recentId: the id of the entry
  * @param updates: the changes to make
  * @param makeTop=false: true to re-order the entry to the top
  * @return true if a change was made, false otherwise
  */
  _updateRecentItem (serviceId, recentId, updates, makeTop = false) {
    const serviceData = this.getServiceData(serviceId)
    if (!serviceData) { return false }

    const updateIndex = serviceData.recent.findIndex((r) => r.id === recentId)
    if (updateIndex === -1) { return false }

    this.saveServiceData(serviceId, serviceData.changeData({
      recent: makeTop
        ? [].concat(
          { ...serviceData.recent[updateIndex], ...updates },
          serviceData.recent.slice(0, updateIndex),
          serviceData.recent.slice(updateIndex + 1)
        )
        : [].concat(
          serviceData.recent.slice(0, updateIndex),
          { ...serviceData.recent[updateIndex], ...updates },
          serviceData.recent.slice(updateIndex + 1)
        )
    }))

    return true
  }

  handleAddRecent ({ serviceId, recentId, tabId, windowType, url, title, favicons }) {
    const serviceData = this.getServiceData(serviceId)
    if (!serviceData) { this.preventDefault(); return }
    if (!url) { this.preventDefault(); return }

    // See if we're going to intelligently replace someone
    const now = new Date().getTime()
    const replaceIndex = serviceData.recent.findIndex((r) => r.url === url)

    if (replaceIndex === -1) {
      this.saveServiceData(serviceId, serviceData.changeData({
        recent: [{
          id: recentId,
          tabId: tabId,
          windowType: windowType,
          url: url,
          title: title,
          favicons: favicons || [],
          created: now,
          modified: now
        }].concat(serviceData.recent).slice(0, 5)
      }))
    } else {
      const replace = serviceData.recent[replaceIndex]
      this.saveServiceData(serviceId, serviceData.changeData({
        recent: [].concat(
          {
            ...replace,
            id: recentId,
            tabId: tabId,
            windowType: windowType,
            url: url,
            title: title || replace.title,
            favicons: favicons && favicons.length ? favicons : replace.favicons,
            modified: now
          },
          serviceData.recent.slice(0, replaceIndex),
          serviceData.recent.slice(replaceIndex + 1)
        )
      }))
    }
  }

  handleUpdateRecentTitle ({ serviceId, recentId, title }) {
    const changed = this._updateRecentItem(serviceId, recentId, {
      title: title,
      modified: new Date().getTime()
    })
    if (!changed) { this.preventDefault() }
  }

  handleUpdateRecentFavicons ({ serviceId, recentId, favicons }) {
    const changed = this._updateRecentItem(serviceId, recentId, {
      favicons: favicons,
      modified: new Date().getTime()
    })
    if (!changed) { this.preventDefault() }
  }

  handleFocusRecent ({ serviceId, recentId }) {
    const changed = this._updateRecentItem(serviceId, recentId, {
      modified: new Date().getTime()
    }, true)
    if (!changed) { this.preventDefault() }
  }

  /* **************************************************************************/
  // Handlers: Reading queue
  /* **************************************************************************/

  handleAddToReadingQueue ({ serviceId, url }) {
    const service = this.getService(serviceId)
    if (!service) { this.preventDefault(); return }
    if (!url) { this.preventDefault(); return }
    const id = uuid.v4()

    this.saveService(serviceId, service.changeData({
      readingQueue: service.readingQueue.concat({
        url: url,
        time: new Date().getTime(),
        id: id
      })
    }))

    // Fetch the meta data
    Promise.resolve()
      .then(() => HtmlMetaService.fetchMeta(url))
      .then((meta) => {
        const service = this.getService(serviceId)
        if (!service) { return }

        this.saveService(serviceId, service.changeData({
          readingQueue: service.readingQueue.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                title: meta.title,
                favicon: meta.favicon
              }
            } else {
              return item
            }
          })
        }))
        this.emitChange()
      })
      .catch((ex) => { /* no-op */ })
  }

  handleRemoveFromReadingQueue ({ serviceId, id }) {
    const service = this.getService(serviceId)
    if (!service) { this.preventDefault(); return }

    this.saveService(serviceId, service.changeData({
      readingQueue: service.readingQueue.filter((b) => b.id !== id)
    }))
  }

  /* **************************************************************************/
  // Handlers: Google Inbox
  /* **************************************************************************/

  handleConvertGoogleInboxToGmail ({ serviceId, duplicateFirst }) {
    const service = this.getService(serviceId)
    if (!service) { this.preventDefault(); return }
    if (service.type !== SERVICE_TYPES.GOOGLE_INBOX) { this.preventDefault(); return }

    if (duplicateFirst) {
      this.preventDefault()
      const mailbox = this.getMailbox(service.parentId)
      actions.createService.defer(service.parentId, mailbox.suggestedServiceUILocation, service.changeData({
        type: SERVICE_TYPES.GOOGLE_MAIL,
        inboxType: GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT,
        wasGoogleInboxService: true,
        id: uuid.v4()
      }))
    } else {
      this.saveService(serviceId, service.changeData({
        type: SERVICE_TYPES.GOOGLE_MAIL,
        inboxType: GoogleMailService.INBOX_TYPES.GMAIL_DEFAULT,
        wasGoogleInboxService: true
      }))
      const serviceData = this.getServiceData(serviceId)
      if (serviceData) {
        this.saveServiceData(serviceData.id, serviceData.changeData({
          parentType: SERVICE_TYPES.GOOGLE_MAIL
        }))
      }
    }
  }

  /* **************************************************************************/
  // Handlers: Sync
  /* **************************************************************************/

  handleUserRequestsIntegratedServiceSync ({ serviceId }) {
    this.preventDefault()
    IEngine.userRequestsSync(serviceId)
  }
}

const accountStore = alt.createStore(AccountStore, STORE_NAME)
IEngine.connectAccountStore(accountStore, actions)
export default accountStore
