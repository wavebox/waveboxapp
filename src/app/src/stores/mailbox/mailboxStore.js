import CoreMailboxStore from 'shared/AltStores/Mailbox/CoreMailboxStore'
import { ServiceReducer } from 'shared/AltStores/Mailbox/MailboxReducers'
import alt from '../alt'
import { session, webContents } from 'electron'
import { STORE_NAME } from 'shared/AltStores/Mailbox/AltMailboxIdentifiers'
import actions from './mailboxActions'
import mailboxPersistence from 'storage/mailboxStorage'
import avatarPersistence from 'storage/avatarStorage'
import { MailboxesSessionManager } from 'SessionManager'
import MailboxesWindow from 'windows/MailboxesWindow'
import WaveboxWindow from 'windows/WaveboxWindow'
import uuid from 'uuid'
import {
  MailboxFactory,
  CoreMailbox
} from 'shared/Models/Accounts'
import {
  PERSISTENCE_INDEX_KEY,
  SERVICE_LOCAL_AVATAR_PREFIX,
  MAILBOX_SLEEP_EXTEND
} from 'shared/constants'

class MailboxStore extends CoreMailboxStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this.sleepingQueue = new Map()

    /* ****************************************/
    // Actions
    /* ****************************************/

    this.bindActions({
      // Mailbox
      handleCreate: actions.CREATE,
      handleRemove: actions.REMOVE,
      handleReduce: actions.REDUCE,
      handleContainersUpdated: actions.CONTAINERS_UPDATED,

      // Services
      handleReduceService: actions.REDUCE_SERVICE,
      handleReduceServiceIfActive: actions.REDUCE_SERVICE_IF_ACTIVE,
      handleReduceServiceIfInactive: actions.REDUCE_SERVICE_IF_INACTIVE,

      // Active
      handleChangeActive: actions.CHANGE_ACTIVE,
      handleChangeActiveToPrev: actions.CHANGE_ACTIVE_TO_PREV,
      handleChangeActiveToNext: actions.CHANGE_ACTIVE_TO_NEXT,
      handleChangeActiveServiceIndex: actions.CHANGE_ACTIVE_SERVICE_INDEX,
      handleChangeActiveServiceToPrev: actions.CHANGE_ACTIVE_SERVICE_TO_PREV,
      handleChangeActiveServiceToNext: actions.CHANGE_ACTIVE_SERVICE_TO_NEXT,

      // Sleeping
      handleAwakenService: actions.AWAKEN_SERVICE,
      handleSleepService: actions.SLEEP_SERVICE,

      // Avatar
      handleSetCustomAvatar: actions.SET_CUSTOM_AVATAR,
      handleSetServiceLocalAvatar: actions.SET_SERVICE_LOCAL_AVATAR,

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
      allAvatars: Array.from(this.avatars.keys()).reduce((acc, k) => {
        acc[k] = this.avatars.get(k)
        return acc
      }, {}),
      allMailboxes: Array.from(this.mailboxes.keys()).reduce((acc, k) => {
        acc[k] = this.mailboxes.get(k).cloneData()
        return acc
      }, {}),
      mailboxIndex: this.index,
      activeMailbox: this.active,
      activeService: this.activeService,
      sleepingServices: Array.from(this.sleepingServices.keys()).reduce((acc, k) => {
        acc[k] = this.sleepingServices.get(k)
        return acc
      }, {})
    }
  }

  /* **************************************************************************/
  // Utils
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
      this.mailboxes.delete(id)
      this.dispatchToRemote('remoteSetMailbox', [id, mailboxJS])
      return undefined
    } else {
      mailboxJS.changedTime = new Date().getTime()
      mailboxJS.id = id
      const model = MailboxFactory.modelize(id, mailboxJS)
      mailboxPersistence.setJSONItem(id, mailboxJS)
      this.mailboxes.set(id, model)
      this.dispatchToRemote('remoteSetMailbox', [id, mailboxJS])
      return model
    }
  }

  /**
  * Persist the provided index
  * @param index: the index to persist
  */
  saveIndex (index) {
    this.index = index
    mailboxPersistence.setJSONItem(PERSISTENCE_INDEX_KEY, index)
    this.dispatchToRemote('remoteSetMailboxIndex', [index])
  }

  /**
  * Saves the active items
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the service type
  */
  saveActive (mailboxId, serviceType) {
    let changed = false
    if (mailboxId !== this.active) {
      this.active = mailboxId
      changed = true
    }
    if (serviceType !== this.activeService) {
      this.activeService = serviceType
      changed = true
    }

    if (changed) {
      this.dispatchToRemote('remoteSetActive', [this.active, this.activeService])
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
      this.dispatchToRemote('remoteSetAvatar', [id, b64Image])
    } else {
      if (!this.avatars.has(id)) { return }
      this.avatars.delete(id)
      avatarPersistence.removeItem(id)
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

  handleCreate ({ id, data }) {
    const mailbox = this.saveMailbox(id, data)
    MailboxesSessionManager.startManagingSession(mailbox)
    this.saveIndex(this.index.concat(id))
    actions.changeActive.defer(id)
  }

  handleRemove ({ id = this.activeMailboxId() }) {
    const wasActive = this.active === id
    this.saveIndex(this.index.filter((i) => i !== id))
    this.saveMailbox(id, null)

    if (wasActive) {
      actions.changeActive.defer(undefined, undefined)
    }
  }

  handleChangeIndex (payload) {
    const next = super.handleChangeIndex(payload)
    this.saveIndex(next)
    return next
  }

  handleReduce ({ id = this.activeMailboxId(), reducer, reducerArgs }) {
    const mailbox = this.mailboxes.get(id)
    if (mailbox) {
      const updatedJS = reducer.apply(this, [mailbox].concat(reducerArgs))
      if (updatedJS) {
        this.saveMailbox(id, updatedJS)
        return
      }
    }

    this.preventDefault()
  }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  handleContainersUpdated ({ containerIds }) {
    if (containerIds.length === 0) {
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
    })
  }

  /* **************************************************************************/
  // Service
  /* **************************************************************************/

  handleReduceService ({ id = this.activeMailboxId(), serviceType = this.activeMailboxService(), reducer, reducerArgs }) {
    const mailbox = this.mailboxes.get(id)
    if (mailbox) {
      const service = mailbox.serviceForType(serviceType)
      if (service) {
        const updatedServiceJS = reducer.apply(this, [mailbox, service].concat(reducerArgs))
        if (updatedServiceJS) {
          const updatedMailboxJS = mailbox.changeData({
            services: mailbox.enabledServices.map((service) => {
              if (service.type === serviceType) {
                return updatedServiceJS
              } else {
                return service.cloneData()
              }
            })
          })
          this.saveMailbox(id, updatedMailboxJS)
          return
        }
      }
    }

    this.preventDefault()
  }

  handleReduceServiceIfActive ({ id = this.activeMailboxId(), serviceType = this.activeMailboxService(), reducer, reducerArgs }) {
    this.preventDefault()
    if (this.isActive(id, serviceType)) {
      actions.reduceService.defer(...[id, serviceType, reducer, ...reducerArgs])
    }
  }

  handleReduceServiceIfInactive ({ id = this.activeMailboxId(), serviceType = this.activeMailboxService(), reducer, reducerArgs }) {
    this.preventDefault()

    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const isMailboxesWindowFocused = mailboxesWindow && mailboxesWindow.isFocused()
    if (!this.isActive(id, serviceType) || !isMailboxesWindowFocused) {
      actions.reduceService.defer(...[id, serviceType, reducer, ...reducerArgs])
    }
  }

  /* **************************************************************************/
  // Handlers: Active
  /* **************************************************************************/

  handleChangeActive ({ id = (this.index[0] || null), service = CoreMailbox.SERVICE_TYPES.DEFAULT }) {
    if (this.isMailboxRestricted(id)) {
      this.preventDefault()
      return
    }

    if (id === this.active && service === this.activeService) {
      this.preventDefault()
      return
    }

    // Work out sleep
    this.scheduleMailboxSleep(this.active, this.activeService)
    this.clearMailboxSleep(id, service)

    // Change active & update model
    this.saveActive(id, service)
    actions.reduceService.defer(id, service, ServiceReducer.mergeChangesetOnActive)
  }

  /**
  * Handles the active mailbox changing to the prev in the index
  * @param allowCycling: if true will cycle back when at end or beginning
  */
  handleChangeActiveToPrev ({ allowCycling }) {
    this.preventDefault()
    const activeIndex = this.index.findIndex((id) => id === this.active)
    let nextId
    if (allowCycling && activeIndex === 0) {
      nextId = this.index[this.index.length - 1] || null
    } else {
      nextId = this.index[Math.max(0, activeIndex - 1)] || null
    }
    actions.changeActive.defer(nextId)
  }

  /**
  * Handles the active mailbox changing to the next in the index
  * @param allowCycling: if true will cycle back when at end or beginning
  */
  handleChangeActiveToNext ({ allowCycling }) {
    this.preventDefault()
    const activeIndex = this.index.findIndex((id) => id === this.active)
    let nextId
    if (allowCycling && activeIndex === this.index.length - 1) {
      nextId = this.index[0] || null
    } else {
      nextId = this.index[Math.min(this.index.length - 1, activeIndex + 1)] || null
    }
    actions.changeActive.defer(nextId)
  }

  /**
  * Handles changing the active service to the one at the service
  * @param index: the index of the service
  */
  handleChangeActiveServiceIndex ({ index }) {
    this.preventDefault()
    if (this.isMailboxRestricted(this.active)) { return }

    const mailbox = this.getMailbox(this.active)
    if (mailbox && mailbox.enabledServiceTypes[index]) {
      actions.changeActive.defer(this.active, mailbox.enabledServiceTypes[index])
    }
  }

  /**
  * Handles the active service changing to the previous in the index
  * @param allowCycling: if true will cycle back when at end or beginning
  */
  handleChangeActiveServiceToPrev ({ allowCycling }) {
    this.preventDefault()
    if (this.isMailboxRestricted(this.active)) { return }

    const mailbox = this.getMailbox(this.active)
    const activeIndex = mailbox.enabledServiceTypes.findIndex((t) => t === this.activeService)

    let nextServiceType
    if (allowCycling && activeIndex === 0) {
      nextServiceType = mailbox.enabledServiceTypes[mailbox.enabledServiceTypes.length - 1] || null
    } else {
      nextServiceType = mailbox.enabledServiceTypes[Math.max(0, activeIndex - 1)] || null
    }
    actions.changeActive.defer(mailbox.id, nextServiceType)
  }

  /**
  * Handles the active service changing to the next in the index
  * @param allowCycling: if true will cycle back when at end or beginning
  */
  handleChangeActiveServiceToNext ({ allowCycling }) {
    this.preventDefault()
    if (this.isMailboxRestricted(this.active)) { return }

    const mailbox = this.getMailbox(this.active)
    const activeIndex = mailbox.enabledServiceTypes.findIndex((t) => t === this.activeService)

    let nextServiceType
    if (allowCycling && activeIndex === mailbox.enabledServiceTypes.length - 1) {
      nextServiceType = mailbox.enabledServiceTypes[0] || null
    } else {
      nextServiceType = mailbox.enabledServiceTypes[Math.min(mailbox.enabledServiceTypes.length - 1, activeIndex + 1)] || null
    }
    actions.changeActive.defer(mailbox.id, nextServiceType)
  }

  /* **************************************************************************/
  // Sleep
  /* **************************************************************************/

  handleAwakenService ({ id, service }) {
    this.clearMailboxSleep(id, service)
  }

  handleSleepService ({ id, service }) {
    this.sleepMailbox(id, service)
  }

  /**
  * Clears sleep for a mailbox and service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  clearMailboxSleep (mailboxId, serviceType) {
    const key = this.getFullServiceKey(mailboxId, serviceType)

    // Clear schedule
    clearTimeout(this.sleepingQueue.get(key) || null)
    this.sleepingQueue.delete(key)

    // Sleep
    this.sleepingServices.set(key, false)
    this.dispatchToRemote('remoteSetSleep', [mailboxId, serviceType, false])
  }

  /**
  * Schedules a new sleep for a mailbox/service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  scheduleMailboxSleep (mailboxId, serviceType) {
    const key = this.getFullServiceKey(mailboxId, serviceType)

    // Clear schedule
    clearTimeout(this.sleepingQueue.get(key) || null)
    this.sleepingQueue.delete(key)

    // Grab info
    const mailbox = this.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : undefined
    const wait = service ? service.sleepableTimeout : 0

    // Queue up
    if (wait <= 0) {
      this.sleepMailbox(mailboxId, serviceType)
    } else {
      // Reschedule
      const sched = setTimeout(() => {
        this.sleepMailbox(mailboxId, serviceType)
      }, wait)
      this.sleepingQueue.set(key, sched)
    }
  }

  /**
  * Runs the process of sending a mailbox to sleep whilst also checking if it owns any other windows
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return true if we did sleep, false otherwise
  */
  sleepMailbox (mailboxId, serviceType) {
    if (this.isSleeping(mailboxId, serviceType)) {
      this.preventDefault()
      return
    }

    const key = this.getFullServiceKey(mailboxId, serviceType)
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    const openWindowCount = mailboxesWindow ? mailboxesWindow.tabManager.getOpenWindowCount(mailboxId, serviceType) : 0
    if (openWindowCount === 0) {
      // Clear previous
      clearTimeout(this.sleepingQueue.get(key) || null)
      this.sleepingQueue.delete(key)

      // Record metrics
      const sleepMetrics = this.generateMailboxSleepMetrics(mailboxId, serviceType)
      this.sleepingMetrics.set(key, sleepMetrics)
      this.dispatchToRemote('remoteSetSleepMetrics', [mailboxId, serviceType, sleepMetrics])

      // Sleep
      this.sleepingServices.set(key, true)
      this.dispatchToRemote('remoteSetSleep', [mailboxId, serviceType, true])
      return true
    } else {
      // Clear previous
      clearTimeout(this.sleepingQueue.get(key) || null)
      this.sleepingQueue.delete(key)

      // Reschedule
      const sched = setTimeout(() => {
        this.sleepMailbox(mailboxId, serviceType)
      }, MAILBOX_SLEEP_EXTEND)
      this.sleepingQueue.set(key, sched)
      return false
    }
  }

  /**
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return the metrics for the web contents or undefined if not found
  */
  generateMailboxSleepMetrics (mailboxId, serviceType) {
    const mailboxesWindow = WaveboxWindow.getOfType(MailboxesWindow)
    return mailboxesWindow ? mailboxesWindow.tabManager.getServiceMetrics(mailboxId, serviceType) : undefined
  }

  /* **************************************************************************/
  // Handlers: Avatar
  /* **************************************************************************/

  handleSetCustomAvatar ({id, b64Image}) {
    const mailbox = this.mailboxes.get(id)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    if (b64Image) { // Set
      const prevAvatarId = mailbox.customAvatarId
      if (mailbox.hasCustomAvatar) {
        if (this.avatars.get(mailbox.customAvatarId) === b64Image) {
          this.preventDefault()
          return
        }
      }

      const avatarId = uuid.v4()
      this.saveAvatar(avatarId, b64Image)
      this.saveMailbox(id, mailbox.changeData({ customAvatar: avatarId }))
      if (prevAvatarId) {
        this.saveAvatar(prevAvatarId, null)
      }
    } else { // Unset
      if (!mailbox.hasCustomAvatar) {
        this.preventDefault()
        return
      }
      const prevAvatarId = mailbox.customAvatarId
      this.saveMailbox(id, mailbox.changeData({ customAvatar: undefined }))
      this.saveAvatar(prevAvatarId, null)
    }
  }

  handleSetServiceLocalAvatar ({ id, b64Image }) {
    const mailbox = this.mailboxes.get(id)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    if (b64Image) {
      const prevAvatarId = mailbox.serviceLocalAvatarId
      if (mailbox.hasServiceLocalAvatar) {
        if (this.avatars.get(mailbox.serviceLocalAvatarId) === b64Image) {
          this.preventDefault()
          return
        }
      }

      const avatarId = `${SERVICE_LOCAL_AVATAR_PREFIX}:${uuid.v4()}`
      this.saveAvatar(avatarId, b64Image)
      this.saveMailbox(id, mailbox.changeData({ serviceLocalAvatar: avatarId }))
      if (prevAvatarId) {
        this.saveAvatar(prevAvatarId, null)
      }
    } else {
      if (!mailbox.hasServiceLocalAvatar) {
        this.preventDefault()
        return
      }

      const prevAvatarId = mailbox.serviceLocalAvatarId
      this.saveMailbox(id, mailbox.changeData({ serviceLocalAvatar: undefined }))
      this.saveAvatar(prevAvatarId, null)
    }
  }

  /* **************************************************************************/
  // Handlers: Auth teardown
  /* **************************************************************************/

  handleClearMailboxBrowserSession ({ mailboxId }) {
    this.preventDefault()

    const mailbox = this.mailboxes.get(mailboxId)
    if (!mailbox) { return }

    const ses = session.fromPartition('persist:' + mailbox.partition)
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
          mailboxesWindow.tabManager.getWebContentIdsForMailbox(mailboxId).forEach((wcId) => {
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

export default alt.createStore(MailboxStore, STORE_NAME)
