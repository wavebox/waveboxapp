import RemoteStore from '../RemoteStore'
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
import ACMailboxAvatar from '../../Models/ACAccounts/Avatar/ACMailboxAvatar'
import ACServiceAvatar from '../../Models/ACAccounts/Avatar/ACServiceAvatar'
import CoreACServiceData from '../../Models/ACAccounts/CoreACServiceData'
import AuthFactory from '../../Models/ACAccounts/AuthFactory'

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
    this._serviceAvatarCache_ = new Map()

    /* ****************************************/
    // Mailboxes
    /* ****************************************/

    /**
    * @return all mailboxes in an array
    */
    this.allMailboxes = () => {
      return this._mailboxIndex_.map((id) => this._mailboxes_.get(id))
    }

    /**
    * @return an object of mailbox id to mailbox
    */
    this.allMailboxesIndexed = () => {
      return this._mailboxIndex_.reduce((acc, id) => {
        acc[id] = this._mailboxes_.get(id)
        return acc
      }, {})
    }

    /**
    * @return an array of mailbox ids
    */
    this.mailboxIds = () => {
      return Array.from(this._mailboxIndex_)
    }

    /**
    * @param id: the id of the mailbox
    * @return the mailbox or null
    */
    this.getMailbox = (id) => {
      return this._mailboxes_.get(id) || null
    }

    /**
    * @param serviceId: the id of the service
    * @return the mailbox for the service
    */
    this.getMailboxForService = (serviceId) => {
      const service = this.getService(serviceId)
      return service ? this.getMailbox(service.parentId) : null
    }

    /**
    * @return the count of mailboxes
    */
    this.mailboxCount = () => {
      return this._mailboxIndex_.length
    }

    /* ****************************************/
    // Mailbox auth
    /* ****************************************/

    /**
    * @param id: the fully qualified id of the auth object
    * @return the auth object or null
    */
    this.getMailboxAuth = (id) => {
      return this._mailboxAuth_.get(id) || null
    }

    /**
    * @param id: the fully qualified id of the auth object
    * @return the true if we have the auth, false otherwise
    */
    this.hasMailboxAuth = (id) => {
      return !!this.getMailboxAuth(id)
    }

    /**
    * @param id: the service id
    * @return the relevant auth object for the service or null
    */
    this.getMailboxAuthForServiceId = (id) => {
      const service = this.getService(id)
      if (!service) { return null }
      return this.getMailboxAuth(CoreACAuth.compositeIdFromService(service))
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return an array of auths that are for that mailbox
    */
    this.getMailboxAuthsForMailbox = (mailboxId) => {
      return Array.from(this._mailboxAuth_.values())
        .filter((a) => a.parentId === mailboxId)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return an array of auth ids that are for that mailbox
    */
    this.getMailboxAuthIdsForMailbox = (mailboxId) => {
      return Array.from(this._mailboxAuth_.values())
        .filter((a) => a.parentId === mailboxId)
        .map((a) => a.id)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return a list of auth ids assoicated with that mailbox
    */
    this.getMailboxAuthIdsForMailbox = (mailboxId) => {
      return this.getMailboxAuthsForMailbox(mailboxId).map((auth) => auth.id)
    }

    /**
    * Looks to see if am auth is invalid or missing for a service
    * @param serviceId: the id of the service
    * @return true if it's invalid, false if not
    */
    this.isMailboxAuthInvalidForServiceId = (serviceId) => {
      const service = this.getService(serviceId)
      if (!service) { return false }
      if (service.supportedAuthNamespace) {
        const auth = this.getMailboxAuthForServiceId(serviceId)
        if (auth) {
          return auth.isAuthInvalid
        } else {
          return true
        }
      } else {
        return false
      }
    }

    /**
    * Looks to see if a mailbox has any services with invalid auths
    * @param mailboxId: the id othe mailbox
    * @return true if any services have invalid auth
    */
    this.hasMailboxServiceWithInvalidAuth = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return false }

      const invalidServiceId = mailbox.allServices.find((serviceId) => {
        return this.isMailboxAuthInvalidForServiceId(serviceId)
      })
      return !!invalidServiceId
    }

    /* ****************************************/
    // Services
    /* ****************************************/

    /**
    * @param id: the service id
    * @return the service or null
    */
    this.getService = (id) => {
      return this._services_.get(id) || null
    }

    /**
    * @return a list of service ids
    */
    this.serviceIds = () => {
      return Array.from(this._services_.keys())
    }

    /**
    * @param id: the service Id
    * @return true if we have a service of that id, false otherwise
    */
    this.hasService = (id) => {
      return this._services_.has(id)
    }

    /**
    * @return the total count of services
    */
    this.serviceCount = () => {
      return this._services_.size
    }

    /**
    * @return the id of the first service, ordered by the mailbox config
    */
    this.firstServiceId = () => {
      const mailbox = this.allMailboxes().find((mailbox) => !!mailbox.allServices.length)
      if (mailbox) {
        return mailbox.allServices[0]
      } else {
        return null
      }
    }

    /**
    * @param type: the service type
    * @return an array of all the services with the given type
    */
    this.allServicesOfType = (type) => {
      return Array.from(this._services_.values())
        .filter((service) => service.type === type)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return an array of services referenced in the mailbox
    */
    this.mailboxServices = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return [] }
      return mailbox.allServices
        .map((serviceId) => this.getService(serviceId))
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param type: the service type
    * @return an array of services with the given type in the given mailbox
    */
    this.mailboxServicesOfType = (mailboxId, type) => {
      return this.mailboxServices(mailboxId)
        .filter((service) => service && service.type === type)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param type: the service type
    * @return an array of service ids with the given type in the given mailbox
    */
    this.mailboxServiceIdsOfType = (mailboxId, type) => {
      return this.mailboxServicesOfType(mailboxId, type).map((service) => service.id)
    }

    /**
    * @return an array of all services in any order
    */
    this.allServicesUnordered = () => {
      return Array.from(this._services_.values())
    }

    /**
    * @return an array of all services in the order dictated by the mailbox config
    */
    this.allServicesOrdered = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        return acc.concat(
          mailbox.allServices.map((serviceId) => this.getService(serviceId))
        )
      }, [])
    }

    /* ****************************************/
    // Service getters resolved
    /* ****************************************/

    /**
    * Gets a resolved service color
    * @param serviceId: the service id
    * @param defaultValue=#FFF: the default value if none is found
    * @return the color
    */
    this.resolvedServiceColor = (serviceId, defaultValue = '#FFF') => {
      const service = this.getService(serviceId)
      const serviceData = this.getServiceData(serviceId)
      if (!service || !serviceData) { return defaultValue }
      return service.getColorWithData(serviceData) || defaultValue
    }

    /**
    * Gets a base resolved mailbox display name
    * @param mailboxId: the mailbox id
    * @param defaultValue=Untitled: the default value if none is found
    * @return the display name
    */
    this.resolvedMailboxBaseDisplayName = (mailboxId, defaultValue = 'Untitled') => {
      const mailbox = this.getMailbox(mailboxId)
      return !mailbox || !mailbox.displayName ? defaultValue : mailbox.displayName
    }

    /**
    * Gets a resolved extended mailbox display name
    * @return the display name or an empty string
    */
    this.resolvedMailboxExtendedDisplayName = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return '' }

      const serviceWithServiceDisplayName = this.getService(
        mailbox
          .allServices
          .find((serviceId) => {
            const service = this.getService(serviceId)
            return service ? service.hasExplicitServiceDisplayName : false
          })
      )

      if (mailbox.hasMultipleServices) {
        const components = [
          serviceWithServiceDisplayName
            ? serviceWithServiceDisplayName.serviceDisplayName
            : undefined,
          `${mailbox.allServiceCount} services`
        ].filter((c) => !!c)
        return components.join(' - ')
      } else {
        if (serviceWithServiceDisplayName) {
          return serviceWithServiceDisplayName.serviceDisplayName
        } else {
          return this.resolvedServiceDisplayName(mailbox.allServices[0], undefined)
        }
      }
    }

    /**
    * Gets a resolved mailbox display name
    * @param mailboxId: the mailbox id
    * @param defaultValue=Untitled: the default value if none is found
    * @param extended=true: when true will return information about the services to give
    *                 a more complete idea of the service name
    * @return the display name
    */
    this.resolvedMailboxDisplayName = (mailboxId, defaultValue = 'Untitled', extended = true) => {
      const mailbox = this.getMailbox(mailboxId)
      if (extended && mailbox && mailbox.showExtendedDispayName) {
        return [
          this.resolvedMailboxBaseDisplayName(mailboxId, defaultValue),
          this.resolvedMailboxExtendedDisplayName(mailboxId)
        ].filter((c) => !!c).join(' : ')
      } else {
        return this.resolvedMailboxBaseDisplayName(mailboxId, defaultValue)
      }
    }

    /**
    * Gets a resolved service display name
    * @param serviceId: the service id
    * @param defaultValue=Untitled: the default value if none is found
    * @return the display name
    */
    this.resolvedServiceDisplayName = (serviceId, defaultValue = 'Untitled') => {
      const service = this.getService(serviceId)
      const serviceData = this.getServiceData(serviceId)
      if (!service || !serviceData) { return defaultValue }
      return service.getDisplayNameWithData(serviceData) || defaultValue
    }

    /**
    * Gets a resolved service url
    * @param serviceId: the service id
    * * @param defaultValue=about:blank: the default value if none is found
    * @return the url
    */
    this.resolvedServiceUrl = (serviceId, defaultValue = 'about:blank') => {
      const service = this.getService(serviceId)
      const serviceData = this.getServiceData(serviceId)
      const serviceAuth = this.getMailboxAuthForServiceId(serviceId) // This is sometimes optional
      if (!service || !serviceData) { return defaultValue }
      return service.getUrlWithData(serviceData, serviceAuth) || defaultValue
    }

    /* ****************************************/
    // Service data
    /* ****************************************/

    /**
    * @param id: the id of the service
    * @return the service data or null. Null will only be when the service is undefined
    */
    this.getServiceData = (id) => {
      if (!this._serviceData_.has(id) && this._services_.has(id)) {
        const service = this.getService(id)
        this._serviceData_.set(id, ServiceFactory.modelizeServiceData(
          CoreACServiceData.createJS(id, service.type)
        ))
      }
      return this._serviceData_.get(id) || null
    }

    /**
    * @return the service data for the active service
    */
    this.activeServiceData = () => {
      return this.getServiceData(this.activeServiceId())
    }

    /* ****************************************/
    // Containers
    /* ****************************************/

    /**
    * @return an array of all the container ids
    */
    this.allContainerIds = () => {
      const ids = this.allServicesOfType(SERVICE_TYPES.CONTAINER).map((service) => service.containerId)
      return Array.from(new Set(ids))
    }

    /* ****************************************/
    // Restrictions
    /* ****************************************/

    /**
    * @param id: the service id
    * @return true if this service is restricted ,false otherwise
    */
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

    /**
    * Looks to see if an entire mailbox is restricted
    * @param mailboxId: the id of the mailbox
    * @return true if all services are restricted
    */
    this.isMailboxRestricted = (mailboxId) => {
      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        const mailbox = this.getMailbox(mailboxId)
        if (!mailbox || mailbox.allServices.legth === 0) { return false }

        const unrestrictedServiceSet = new Set(this.unrestrictedServiceIds())
        const unrestrictedMailboxServices = mailbox.allServices.filter((serviceId) => unrestrictedServiceSet.has(serviceId))
        return unrestrictedMailboxServices.length === 0
      } else {
        return false
      }
    }

    /**
    * @return an array of services that unrestricted
    */
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

    /**
    * @return an array of service ids that are unrestricted
    */
    this.unrestrictedServiceIds = () => {
      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        return Array.from(this._services_.values())
          .filter((service) => user.hasAccountsOfType(service.type))
          .slice(0, user.accountLimit)
          .map((service) => service.id)
      } else {
        return Array.from(this._services_.keys())
      }
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return an array of services that are unrestricted for a mailbox
    */
    this.unrestrictedMailboxServiceIds = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return [] }

      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        const unrestrictedServiceSet = new Set(this.unrestrictedServiceIds())
        return mailbox.allServices
          .filter((serviceId) => unrestrictedServiceSet.has(serviceId))
      } else {
        return mailbox.allServices
      }
    }

    /**
    * @param serviceTypes: a list of services types to check if they would be restricted
    * @return a list of services types that would be restricted if setup. This function
    * assumes the serviceTypes are unique
    */
    this.proposedRestrictedServiceTypes = (serviceTypes) => {
      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        let proposedServiceCount = this.serviceCount()
        const restricted = serviceTypes.filter((type) => {
          if (!user.hasAccountsOfType(type)) {
            return true
          } else {
            if (user.hasAccountLimit && proposedServiceCount > user.accountLimit) {
              return true
            } else {
              proposedServiceCount++
              return false
            }
          }
        })
        return restricted
      } else {
        return []
      }
    }

    /* ****************************************/
    // Active
    /* ****************************************/

    /**
    * @return the id of the active service
    */
    this.activeServiceId = () => {
      return this._activeServiceId_ ? this._activeServiceId_ : this.firstServiceId()
    }

    /**
    * @param serviceId: the id of the servie to check
    * @return true if the service is active, false otherwise
    */
    this.isServiceActive = (serviceId) => {
      return this.activeServiceId() === serviceId
    }

    /**
    * @return the active service or null
    */
    this.activeService = () => {
      return this.getService(this.activeServiceId())
    }

    /**
    * @return the id of the active mailbox
    */
    this.activeMailboxId = () => {
      const service = this.activeService()
      return service ? service.parentId : null
    }

    /**
    * @return the active mailbox or null
    */
    this.activeMailbox = () => {
      return this.getMailbox(this.activeMailboxId())
    }

    /* ****************************************/
    // Sleeping
    /* ****************************************/

    /**
    * @param serviceId: the id of the service to check
    * @return true if the service is sleeping, false otherwise
    */
    this.isServiceSleeping = (serviceId) => {
      if (!this.getUser().hasSleepable) { return false }

      if (this._sleepingServices_.get(serviceId) === true) {
        return true
      } else if (this._sleepingServices_.get(serviceId) === false) {
        return false
      } else {
        // If we don't have an explicit value set we have to guess if we're sleeping or not
        const service = this.getService(serviceId)
        if (service && service.sleepable) {
          if (this.isServiceActive(serviceId)) {
            return false
          } else {
            return true
          }
        } else {
          return false
        }
      }
    }

    /**
    * @param mailboxId: the id of the mailbox to check
    * @return true if all services in the mailbox are sleeping, false otherwise
    */
    this.isMailboxSleeping = (mailboxId) => {
      if (!this.getUser().hasSleepable) { return false }

      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return false }

      const awake = mailbox.allServices.find((serviceId) => !this.isServiceSleeping(serviceId))
      return !awake
    }

    /**
    * @param serviceId: the id of the service
    * @return the sleep notification info for the given service or undefined
    */
    this.getSleepingNotificationInfo = (serviceId) => {
      const service = this.getService(serviceId)
      if (!service || service.hasSeenSleepableWizard) { return undefined }

      // As well as checking if we are sleeping, also check we have an entry in the
      // sleep queue. This indicates were not sleeping from launch
      if (!this.isServiceSleeping(serviceId)) { return undefined }

      const metrics = this._sleepingMetrics_.get(serviceId)
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

    /**
    * Gets the avatar
    * @param avatarId: the id of the avatar
    * @return the avatar or undefined
    */
    this.getAvatar = (avatarId) => {
      return this._avatars_.get(avatarId)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return a ACMailboxAvatar which defines the avatar display config for the mailbox
    */
    this.getMailboxAvatarConfig = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      const avatarConfig = new ACMailboxAvatar(mailbox ? (
        ACMailboxAvatar.autocreate(mailbox, this._services_, this._serviceData_, this._avatars_)
      ) : (
        {}
      ))

      if (this._mailboxAvatarCache_.has(mailboxId)) {
        if (this._mailboxAvatarCache_.get(mailboxId).hashId !== avatarConfig.hashId) {
          this._mailboxAvatarCache_.set(mailboxId, avatarConfig)
        }
      } else {
        this._mailboxAvatarCache_.set(mailboxId, avatarConfig)
      }

      return this._mailboxAvatarCache_.get(mailboxId)
    }

    /**
    * @param serviceId: the id of the service
    * @return a ACServiceAvatar which defines the avatar display config for the mailbox
    */
    this.getServiceAvatarConfig = (serviceId) => {
      const service = this.getService(serviceId)
      const serviceData = this.getServiceData(serviceId)
      const mailbox = service ? this.getMailbox(service.parentId) : undefined

      const config = new ACServiceAvatar(mailbox && service && serviceData ? (
        ACServiceAvatar.autocreate(mailbox, service, serviceData, this._avatars_)
      ) : (
        {}
      ))

      if (this._serviceAvatarCache_.has(serviceId)) {
        if (this._serviceAvatarCache_.get(serviceId).hashId !== config.hashId) {
          this._serviceAvatarCache_.set(serviceId, config)
        }
      } else {
        this._serviceAvatarCache_.set(serviceId, config)
      }

      return this._serviceAvatarCache_.get(serviceId)
    }

    /* ****************************************/
    // Unread & tray
    /* ****************************************/

    /**
    * @return the total unread count for the users restriction
    */
    this.userUnreadCount = () => {
      return this.unrestrictedServices().reduce((acc, service) => {
        return acc + this.getServiceData(service.id).getUnreadCount(service)
      }, 0)
    }

    /**
    * @return the total app unread count for the users restriction
    */
    this.userUnreadCountForApp = () => {
      return this.unrestrictedServices().reduce((acc, service) => {
        if (service.showBadgeCountInApp) {
          return acc + this.getServiceData(service.id).getUnreadCount(service)
        } else {
          return acc
        }
      }, 0)
    }

    /**
    * @return true if the users restriction has unread activity on the app
    */
    this.userUnreadActivityForApp = () => {
      return !!this.unrestrictedServices().find((service) => {
        if (service.showBadgeActivityInApp) {
          return this.getServiceData(service.id).getHasUnreadActivity(service)
        } else {
          return false
        }
      })
    }

    /**
    * @param mailboxId: the id of the mailbox to get the unread count for
    * @return the unread count for the given mailbox and user restriction
    */
    this.userUnreadCountForMailbox = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return 0 }
      const unrestrictedServiceSet = new Set(this.unrestrictedServices().map((s) => s.id))

      return mailbox.allServices.reduce((acc, serviceId) => {
        if (unrestrictedServiceSet.has(serviceId)) {
          const service = this.getService(serviceId)
          if (service.showBadgeCount) {
            const serviceData = this.getServiceData(serviceId)
            return acc + serviceData.getUnreadCount(service)
          } else {
            return acc
          }
        }

        return acc
      }, 0)
    }

    /**
    * @param mailboxId: the id of the mailbox to get the unread activity for
    * @return true if there is unread activity for the mailbox and user restriction
    */
    this.userUnreadActivityForMailbox = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return false }
      const unrestrictedServiceSet = new Set(this.unrestrictedServices().map((s) => s.id))

      return !!mailbox.allServices.find((serviceId) => {
        if (unrestrictedServiceSet.has(serviceId)) {
          const service = this.getService(serviceId)
          if (service.showBadgeActivity) {
            const serviceData = this.getServiceData(serviceId)
            return serviceData.getHasUnreadActivity(service)
          } else {
            return false
          }
        } else {
          return false
        }
      })
    }

    /**
    * @return a list of tray messages for the users restriction
    */
    this.userTrayMessages = () => {
      return this.unrestrictedServices().reduce((acc, service) => {
        return acc.concat(this.getServiceData(service.id).getTrayMessages(service))
      }, [])
    }

    /**
    * @param mailboxId: the id of the mailbox to get the messages for
    * @return a list of tray messages for the mailbox and users restriction
    */
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

    /**
    * @return an array of all partition ids used
    */
    this.allPartitions = () => {
      return [].concat(
        Array.from(this._mailboxes_.values())
          .map((mailbox) => mailbox.partitonId),
        Array.from(this._services_.values())
          .filter((service) => service.sandboxFromMailbox)
          .map((service) => service.partitionId)
      )
    }

    /**
    * Gets all the partitions in use in a single mailbox
    * @return an array of all partitions in a mailbox
    */
    this.allPartitionsInMailbox = (mailboxId) => {
      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return [] }

      return [].concat(
        [mailbox.partitionId],
        mailbox.allServices
          .map((serviceId) => this.getService(serviceId))
          .filter((service) => service && service.sandboxFromMailbox)
          .map((service) => service.partitionId)
      )
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleChangeMailboxIndex: actions.CHANGE_MAILBOX_INDEX
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
      acc.set(id, new ACMailbox(mailboxes[id]))
      return acc
    }, new Map())
    this._mailboxAuth_ = Object.keys(mailboxAuth).reduce((acc, id) => {
      acc.set(id, AuthFactory.modelizeAuth(mailboxAuth[id]))
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
    this._avatars_ = Object.keys(avatars).reduce((acc, id) => {
      acc.set(id, avatars[id])
      return acc
    }, new Map())

    // Active & Sleep
    this._activeServiceId_ = activeService || this.firstServiceId() // Make sure we glue the value if it's not defined
    this._sleepingServices_ = Object.keys(sleepingServices).reduce((acc, k) => {
      acc.set(k, sleepingServices[k])
      return acc
    }, new Map())
  }

  /* **************************************************************************/
  // Mailboxes
  /* **************************************************************************/

  handleChangeMailboxIndex ({ id, nextIndex }) {
    const index = Array.from(this._mailboxIndex_)
    const prevIndex = index.findIndex((i) => i === id)
    if (prevIndex !== -1) {
      index.splice(nextIndex, 0, index.splice(prevIndex, 1)[0])
      this._mailboxIndex_ = index
    } else {
      this.preventDefault()
    }
    return this._mailboxIndex_
  }
}

export default CoreAccountStore
