import RemoteStore from '../RemoteStore'
import { BLANK_PNG } from '../../b64Assets'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltAccountIdentifiers'
import AltUserIdentifiers from '../User/AltUserIdentifiers'
import SERVICE_TYPES from '../../Models/ACAccounts/ServiceTypes'
import ACMailbox from '../../Models/ACAccounts/ACMailbox'
import CoreACAuth from '../../Models/ACAccounts/CoreACAuth'
import ServiceFactory from '../../Models/ACAccounts/ServiceFactory'
import ACMailboxAvatar from '../../Models/ACAccounts/ACMailboxAvatar'

//TODO if you run an import, serviceData wont be imported. Handle this case

class CoreAccountStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    // Data
    this._mailboxIndex_ = []
    this._mailboxes_ = new Map()
    this._services_ = new Map()
    this._serviceData_ = new Map()
    this._mailboxAuth_ = new Map()
    this._avatars_ = new Map()

    // State
    this._activeServiceId_ = null
    this._sleepingServices_ = new Map()
    this._sleepingMetrics_ = new Map()
    this._mailboxAvatarCache_ = new Map()

    /* ****************************************/
    // Mailboxes
    /* ****************************************/

    this.allMailboxes = () => {
      return this._mailboxIndex_.map((id) => this._mailboxes_.get(id))
    }

    this.allMailboxesIndexed = () => {
      return this._mailboxIndex_.reduce((acc, id) => {
        acc[id] = this._mailboxes_.get(id)
        return acc
      }, {})
    }

    this.mailboxIds = () => { return Array.from(this._index_) }

    this.getMailbox = (id) => { return this._mailboxes_.get(id) || null }

    this.mailboxCount = () => { return this._mailboxIndex_.length }

    /* ****************************************/
    // Mailbox auth
    /* ****************************************/

    this.getMailboxAuth = (id) => {
      return this._mailboxAuth_.get(id) || null
    }

    this.getMailboxAuthForMailbox = (mailboxId, namespace) => {
      return this._mailboxAuth_.get(CoreACAuth.compositeId(parentId, namespace)) || null
    }

    this.getMailboxAuthsForMailbox = (mailboxId) => {
      return Array.from(this._mailboxAuth_.values()).filter((a) => a.parentId === mailboxId)
    }

    this.getMailboxAuthIdsForMailbox = (mailboxId) => {
      return this.getMailboxAuthsForMailbox(mailboxId).map((auth) => auth.id)
    }

    /* ****************************************/
    // Services
    /* ****************************************/

    this.getService = (id) => { return this._services_.get(id) || null }

    this.hasService = (id) => { return this._services_.has(id) }

    this.serviceCount = () => { return this._services_.size }

    this.firstServiceId = () => {
      const mailbox = this.allMailboxes().find((mailbox) => !!mailbox.allServices.length)
      if (mailbox) {
        return mailbox.allServices[0]
      } else {
        return null
      }
    }

    this.allServicesOfType = (type) => {
      return Array.from(this._services_.values())
        .filter((service) => service.type === type)
    }

    this.allServicesOrdered = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        return acc.concat(
          mailbox.allServices().map((serviceId) => this.getService(serviceId))
        )
      }, [])
    }

    /* ****************************************/
    // Service data
    /* ****************************************/

    this.getServiceData = (id) => { return this._serviceData_.get(id) || null }

    this.activeServiceData = () => { return this.getServiceData(this.activeServiceId()) }

    /* ****************************************/
    // Containers
    /* ****************************************/

    this.allContainerIds = () => {
      const ids = this.allServicesOfType(SERVICE_TYPES.CONTAINER).map((service) => service.containerId)
      return Array.from(new Set(ids))
    }

    /* ****************************************/
    // Restrictions
    /* ****************************************/

    this.isServiceRestricted = (id) => {
      if (this.serviceCount() === 0) { return false }

      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        return !this
          .allServicesOrdered()
          .filter((service) => user.hasAccountsOfType(service.type))
          .slice(0, user.accountLimit)
          .find((service) => service.id === id)
      } else {
        return false
      }
    }

    this.unrestrictedServices = () => {
      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        return Array.from(this._services_.values())
          .filter((service) => user.hasAccountsOfType(service.type))
          .slice(0, user.accountLimit)
      } else {
        return Array.from(this._services_.values())
      }
    }

    /* ****************************************/
    // Active
    /* ****************************************/

    this.activeServiceId = () => {
      return this._activeServiceId_ !== null ? this._activeServiceId_ : this.firstServiceId()
    }

    this.isServiceActive = (serviceId) => { return this.activeServiceId() === serviceId }

    this.activeService = () => { return this.getService(this.activeServiceId()) }

    this.activeMailboxId = () => {
      const service = this.activeService()
      return service ? service.parentId : null
    }

    this.activeMailbox = () => { return this.getMailbox(this.activeMailboxId()) }

    /* ****************************************/
    // Sleeping
    /* ****************************************/

    this.isServiceSleeping = (serviceId) => {
      if (!this.getUser().hasSleepable) { return false }

      if (this._sleepingServices_.has(serviceId)) {
        return this._sleepingServices_.get(serviceId) === true
      } else {
        // If we're not explicitly set to be sleeping/awake use the active state as a great guess
        if (this.isServiceActive(serviceId)) {
          return false
        } else {
          return true
        }
      }
    }

    this.isMailboxSleeping = (mailboxId) => {
      if (!this.getUser().hasSleepable) { return false }

      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return false }

      const awake = mailbox.allServices.find((serviceId) => !this.isServiceSleeping(serviceId))
      return !awake
    }

    this.getSleepingNotificationInfo = (serviceId) => {
      const service = this.getService(serviceId)
      if (!service || service.hasSeenSleepableWizard) { return undefined }

      // As well as checking if we are sleeping, also check we have an entry in the
      // sleep queue. This indicates were not sleeping from launch
      if (!this.isServiceSleeping(serviceId)) { return undefined }

      const metrics = this.sleepingMetrics.get(serviceId)
      if (!metrics) { return undefined }

      // Build the return info
      return {
        service: service,
        closeMetrics: metrics
      }
    }

    /* ****************************************/
    // Avatar
    /* ****************************************/

    this.getMailboxAvatarConfig = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      const avatarConfig = mailbox ? (
        ACMailboxAvatar.autocreate(mailbox, this._services_, this._avatars_)
      ) : (
        new ACMailboxAvatar({})
      )

      if (this._mailboxAvatarCache_.has(mailboxId)) {
        if (this._mailboxAvatarCache_.get(mailboxId).hashId !== avatar.hashId) {
          this._mailboxAvatarCache_.set(mailboxId, avatarConfig)
        }
      } else {
        this._mailboxAvatarCache_.set(mailboxId, avatarConfig)
      }

      return this._mailboxAvatarCache_.get(mailboxId)
    }

    /* ****************************************/
    // Unread & tray
    /* ****************************************/

    this.userUnreadCount = () => {
      return this.unrestrictedServices().reduce((acc, service) => {
        return acc + this.getServiceData(service.id).getUnreadCount(service)
      }, 0)
    }

    this.userUnreadCountForApp = () => {
      return this.unrestrictedServices().reduce((acc, service) => {
        if (service.showBadgeCountInApp) {
          return acc + this.getServiceData(service.id).getUnreadCount(service)
        } else {
          return acc
        }
      }, 0)
    }

    this.userUnreadActivityForApp = () => {
      return !!this.unrestrictedServices().find((service) => {
        if (service.showUnreadActivityInApp) {
          return this.getServiceData(service.id).getHasUnreadActivity(service)
        } else {
          return false
        }
      })
    }

    this.userTrayMessages = () => {
      return this.unrestrictedServices().reduce((acc, service) => {
        return acc.concat(this.getServiceData(service.id).getTrayMessages(service))
      }, [])
    }

    this.userTrayMessagesForMailbox = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return [] }
      const unrestrictedServiceSet = new Set(this.unrestrictedServices().map((s) => s.id))

      return mailbox.allServices.reduce((acc, serviceId) => {
        if (unrestrictedServiceSet.has(serviceId)) {
          const service = this.getService(serviceId)
          const serviceData = this.getServiceData(serviceId)
          return acc.concat(serviceData.getTrayMessages(service))
        }

        return acc
      }, [])
    }

    /* ****************************************/
    // Misc
    /* ****************************************/

    this.allPartitions = () => {
      return Array.from(this._mailboxes_.values()).map((mailbox) => mailbox.partiton)
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD
    })
  }

  /* **************************************************************************/
  // Utils: UserStore cross linking
  /* **************************************************************************/

  /**
  * Tries to source the user from the user store
  * @return the user or a default representation
  */
  getUser () {
    const userStore = this.alt.getStore(AltUserIdentifiers.STORE_NAME)
    if (userStore) {
      const user = userStore.getState().user
      if (user) {
        return user
      }
    }

    throw new Error(`Alt "${STORE_NAME}" unable to locate "${AltUserIdentifiers.STORE_NAME}". Ensure both have been linked`)
  }

  /**
  * Gets a container from the user store
  * @param containerId: the container
  * @return the container or undefined if it's unknown
  */
  getContainer (containerId) {
    const userStore = this.alt.getStore(AltUserIdentifiers.STORE_NAME)
    if (userStore) {
      return userStore.getState().getContainer(containerId)
    }

    throw new Error(`Alt "${STORE_NAME}" unable to locate "${AltUserIdentifiers.STORE_NAME}". Ensure both have been linked`)
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad (payload) {
    const {
      mailboxIndex,
      mailboxes,
      services,
      serviceData,
      mailboxAuth,
      avatars,
      activeService,
      sleepingServices
    } = payload

    // Mailboxes
    this._mailboxIndex_ = mailboxIndex
    this._mailboxes_ = Object.keys(mailboxes).reduce((acc, id) => {
      acc.set(id, require("../../Models/UndefinedPropProxy")(new ACMailbox(mailboxes[id])))
      return acc
    }, new Map())
    this._mailboxAuth_ = Object.keys(mailboxAuth).reduce((acc, id) => {
      acc.set(id, new CoreACAuth(mailboxAuth[id]))
      return acc
    }, new Map())

    // Services
    this._services_ = Object.keys(services).reduce((acc, id) => {
      acc.set(id, ServiceFactory.modelizeService(services[id]))
      return acc
    }, new Map())
    this._serviceData_ = Object.keys(serviceData).reduce((acc, id) => {
      acc.set(id, ServiceFactory.modelizeServiceData(serviceData[id]))
      return acc
    }, new Map())

    // Avatars
    this.avatars = Object.keys(avatars).reduce((acc, id) => {
      acc.set(id, avatars[id])
      return acc
    }, new Map())

    // Active & Sleep
    this._activeServiceId_ = activeService
    this._sleepingServices_ = Object.keys(sleepingServices).reduce((acc, k) => {
      acc.set(k, sleepingServices[k])
      return acc
    }, new Map())
  }
}

export default CoreAccountStore
