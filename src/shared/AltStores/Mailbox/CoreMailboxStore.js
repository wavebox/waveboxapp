import RemoteStore from '../RemoteStore'
import { BLANK_PNG } from '../../b64Assets'
import {
  CoreMailbox,
  MailboxFactory
} from '../../Models/Accounts'
import {
  PERSISTENCE_INDEX_KEY,
  SERVICE_LOCAL_AVATAR_PREFIX,
  MAILBOX_SLEEP_EXTEND
} from '../../constants'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltMailboxIdentifiers'
import AltUserIdentifiers from '../User/AltUserIdentifiers'
import User from '../../Models/User'

class CoreMailboxStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    // Mailboxes
    this.index = []
    this.mailboxes = new Map()

    // Active
    this.active = null
    this.activeService = CoreMailbox.SERVICE_TYPES.DEFAULT

    // Sleep
    this.sleepingServices = new Set()
    this.sleepingMetrics = new Map()

    // Media
    this.avatars = new Map()
    //this.snapshots = new Map() //move me into guest?

    // Runtime
    //this.webcontentTabIds = new Map() //unify me into main - use by content windows
    //this.search = new Map() //unify me into main - use by contentwindows

    /* ****************************************/
    // Mailboxes
    /* ****************************************/

    /**
    * @return all the mailboxes in order
    */
    this.allMailboxes = () => {
      return this.index.map((id) => this.mailboxes.get(id))
    }

    /**
    * @return all the mailboxes in an object
    */
    this.allMailboxesIndexed = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        acc[mailbox.id] = mailbox
        return acc
      }, {})
    }

    /**
    * @return the ids
    */
    this.mailboxIds = () => {
      return Array.from(this.index)
    }

    /**
    * @return the mailbox
    */
    this.getMailbox = (id) => {
      return this.mailboxes.get(id) || null
    }

    /**
    * @return the count of mailboxes
    */
    this.mailboxCount = () => {
      return this.mailboxes.size
    }

    /**
    * @param type: the type of mailboxes to return
    * @return a list of mailboxes with the given type
    */
    this.getMailboxesOfType = (type) => {
      return this.allMailboxes().filter((mailbox) => mailbox.type === type)
    }

    /**
    * @return a list of mailboxes that support wavebox auth
    */
    this.getMailboxesSupportingWaveboxAuth = () => {
      return this.allMailboxes().filter((mailbox) => mailbox.supportsWaveboxAuth)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return true if this is the first mailbox
    */
    this.mailboxIsAtFirstIndex = (mailboxId) => {
      return this.index[0] === mailboxId
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return true if this is the last mailbox
    */
    this.mailboxIsAtLastIndex = (mailboxId) => {
      return this.index[this.index.length - 1] === mailboxId
    }

    /* ****************************************/
    // Mailbox Restrictions
    /* ****************************************/

    /**
    * @param id: the mailbox id
    * @return true if the mailbox is restricted, false otherwise
    */
    this.isMailboxRestricted = (id) => { //TODO dropuser
      if (this.mailboxCount() === 0) { return false }

      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        return !this
          .allMailboxes()
          .filter((mailbox) => user.hasAccountsOfType(mailbox.type))
          .slice(0, user.accountLimit)
          .find((mailbox) => mailbox.id === id)
      } else {
        return false
      }
    }

    /**

    * @return a list of unrestricted mailbox ids
    */
    this.unrestrictedMailboxIds = () => { //TODO dropuser
      const user = this.getUser()
      if (user.hasAccountLimit || user.hasAccountTypeRestriction) {
        return this
          .allMailboxes()
          .filter((mailbox) => user.hasAccountsOfType(mailbox.type))
          .slice(0, user.accountLimit)
          .map((mailbox) => mailbox.id)
      } else {
        return this.mailboxIds()
      }
    }

    /**
    * Checks to see if the user can add a new unrestricted account
    * @return true if the user can add a mailbox, false otherwise
    */
    this.canAddUnrestrictedMailbox = () => { //TODO drop user
      const user = this.getUser()
      return this.unrestrictedMailboxIds().length < user.accountLimit
    }

    /* ****************************************/
    // Services
    /* ****************************************/

    /**
    * @return a list of all services
    */
    this.allServices = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        return acc.concat(mailbox.enabledServices)
      }, [])
    }

    /**
    * @return an array of services that support compose
    */
    this.getServicesSupportingCompose = () => {
      return this.allServices()
        .filter((service) => service.supportsCompose)
    }

    /**
    * @param protocol: the protocol to get services for
    * @return an array of services that support the given protocol
    */
    this.getServicesSupportingProtocol = (protocol) => {
      return this.allServices()
        .filter((service) => service.supportedProtocols.has(protocol))
    }

    /* ****************************************/
    // Avatar
    /* ****************************************/

    /**
    * @param id: the id of the mailbox
    * @return the avatar base64 string or a blank png string
    */
    this.getAvatar = (id) => {
      return this.avatars.get(id) || BLANK_PNG
    }

    /**
    * Gets the mailbox avatar using the order of precidence
    * @param id: the id of the mailbox
    * @return the url/base64 avatar url or undefiend if none
    */
    this.getResolvedAvatar = (id) => {
      const mailbox = this.getMailbox(id)
      if (!mailbox) { return }

      if (mailbox.hasCustomAvatar) {
        return this.getAvatar(mailbox.customAvatarId)
      } else if (mailbox.avatarURL) {
        return mailbox.avatarURL
      } else if (mailbox.hasServiceLocalAvatar) {
        return this.getAvatar(mailbox.serviceLocalAvatarId)
      } else if (!mailbox.avatarCharacterDisplay) {
        const logoPath = mailbox.humanizedLogo || mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo
        if (logoPath) {
          return Resolver.image(logoPath) //TODO i'm at runtime
        }
      }
    }

    /* ****************************************/
    // Snapshots
    /* ****************************************/

    /**
    * @param id: the id of the mailbox
    * @param service: the type of service
    * @return the snapshot base64 string
    */
    //this.getSnapshot = (id, service) => {
    //  return this.snapshots.get(`${id}:${service}`)
    //}

    /* ****************************************/
    // Active
    /* ****************************************/

    /**
    * @return the id of the active mailbox
    */
    this.activeMailboxId = () => { return this.active }

    /**
    * @return the service type of the active mailbox
    */
    this.activeMailboxService = () => {
      if (this.activeService === CoreMailbox.SERVICE_TYPES.DEFAULT) {
        return CoreMailbox.SERVICE_TYPES.DEFAULT
      } else {
        const mailbox = this.activeMailbox()
        if (mailbox) {
          const service = mailbox.serviceForType(this.activeService)
          return service ? this.activeService : CoreMailbox.SERVICE_TYPES.DEFAULT
        } else {
          return CoreMailbox.SERVICE_TYPES.DEFAULT
        }
      }
    }

    /**
    * @return the active mailbox
    */
    this.activeMailbox = () => {
      return this.mailboxes.get(this.active)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the type of service
    * @return true if this mailbox is active, false otherwise
    */
    this.isActive = (mailboxId, service) => {
      return this.activeMailboxId() === mailboxId && this.activeMailboxService() === service
    }

    /* ****************************************/
    // Sleeping
    /* ****************************************/

    /**
    * @param mailboxId: the id of the mailbox
    * @param serviceType: the type of service
    * @return true if the mailbox is sleeping
    */
    this.isSleeping = (mailboxId, serviceType) => { //TODO userState? checkusages and this.getUser()
      if (!this.getUser().hasSleepable) { return false }

      // Check we support sleeping
      const mailbox = this.getMailbox(mailboxId)
      const service = mailbox ? mailbox.serviceForType(serviceType) : undefined
      if (!service || !service.sleepable) { return false }

      // Check if we are active
      if (this.isActive(mailboxId, serviceType)) { return false }

      // Check if we are queued for sleeping sleeping
      return this.sleepingServices.has(this.getFullServiceKey(mailboxId, serviceType))
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @return true if all services are sleeping
    */
    this.isAllServicesSleeping = (mailboxId) => {
      if (!this.getUser().hasSleepable) { return false }

      const mailbox = this.getMailbox(mailboxId)
      if (!mailbox) { return false }
      const awake = mailbox.enabledServiceTypes.find((serviceType) => {
        return !this.isSleeping(mailboxId, serviceType)
      })
      return !awake
    }

    /**
    * Checks to see if we should show a sleeping notification and returns some
    * info if the mailbox is sleeping
    * @param mailboxId: the id of the mailbox
    * @param serviceType: the type of service
    * @return some sleep info {mailbox,service,closeMetrics} or undefined if there is no notification to show
    */
    this.getSleepingNotificationInfo = (mailboxId, serviceType) => { //TODO userStore  checkusages and this.getUser()
      if (serviceType !== CoreMailbox.SERVICE_TYPES.DEFAULT) { return } // Only support default right now

      if (this.getWireConfigExperiments().showDefaultServiceSleepNotifications !== true) { return }

      const mailbox = this.getMailbox(mailboxId)
      const service = mailbox ? mailbox.serviceForType(serviceType) : undefined
      if (!service || service.hasSeenSleepableWizard) { return }

      // As well as checking if we are sleeping, also check we have an entry in the
      // sleep queue. This indicates were not sleeping from launch
      if (!this.isSleeping(mailboxId, serviceType)) { return undefined }

      const metrics = this.sleepingMetrics.get(this.getFullServiceKey(mailboxId, serviceType))
      if (!metrics) { return undefined }

      // Build the return info
      return {
        mailbox: mailbox,
        service: service,
        closeMetrics: metrics
      }
    }

    /* ****************************************/
    // Unread
    /* ****************************************/

    /**
    * @return the total amount of unread items
    */
    this.totalUnreadCountForUser = () => { //userstore  checkusages and this.getUser()
      const hasServices = this.getUser().hasServices
      return this.allMailboxes().reduce((acc, mailbox) => {
        if (mailbox) {
          acc += mailbox.getUnreadCount(!hasServices)
        }
        return acc
      }, 0)
    }

    /**
    * @return the total amount of unread items taking mailbox settings into account
    */
    this.totalUnreadCountForAppBadgeForUser = () => { //userstore  checkusages and this.getUser()
      const hasServices = this.getUser().hasServices
      return this.allMailboxes().reduce((acc, mailbox) => {
        if (mailbox) {
          return acc + mailbox.getUnreadCountForAppBadge(!hasServices)
        } else {
          return acc
        }
      }, 0)
    }

    /**
    * @return true if any mailboxes have another unread info status, taking settings into account
    */
    this.hasUnreadActivityForAppBadgeForUser = () => { //userstore  checkusages and this.getUser()
      const hasServices = this.getUser().hasServices
      return !!this.allMailboxes().find((mailbox) => {
        return mailbox && mailbox.getUnreadActivityForAppbadge(!hasServices)
      })
    }

    /**
    * Gets the unread count taking into account the current user state
    * @param id: the id of the mailbox
    * @return the unread count
    */
    this.mailboxUnreadCountForUser = (id) => { //userstore  checkusages and this.getUser()
      const mailbox = this.getMailbox(id)
      if (!mailbox) { return 0 }
      return mailbox.getUnreadCount(!this.getUser().hasServices)
    }

    /**
    * Gets the unread activity taking into account the current user state
    * @param id: the id of the mailbox
    * @return true if there is unread activity for the account
    */
    this.mailboxHasUnreadActivityForUser = (id) => { //userstore  checkusages and this.getUser()
      const mailbox = this.getMailbox(id)
      if (!mailbox) { return false }
      return mailbox.getHasUnreadActivity(!this.getUser().hasServices)
    }

    /**
    * @param id: the id of the mailbox
    * @return the array of tray messages
    */
    this.mailboxTrayMessagesForUser = (id) => { //userstore  checkusages and this.getUser()
      const mailbox = this.getMailbox(id)
      if (!mailbox) { return [] }
      return mailbox.getTrayMessages(!this.getUser().hasServices)
    }

    /* ****************************************/
    // Takeout
    /* ****************************************/

    /**
    * Exports the data synchronously
    * @return the raw data
    */
    this.exportMailboxDataSync = () => { //?
      const allData = mailboxPersistence.allItemsSync()
      return Object.keys(allData)
        .reduce((acc, id) => {
          if (id === PERSISTENCE_INDEX_KEY) {
            acc[id] = allData[id]
          } else {
            const data = JSON.parse(allData[id])
            const MailboxClass = MailboxFactory.getClass(data.type)
            if (MailboxClass) {
              acc[id] = JSON.stringify(MailboxClass.prepareForExport(id, data))
            } else {
              acc[id] = allData[id]
            }
          }
          return acc
        }, {})
    }

    /**
    * Exports the data synchronously
    * @return the raw data
    */
    this.exportAvatarDataSync = () => { //?
      return avatarPersistence.allItemsSync()
    }

    /* ****************************************/
    // Tabs
    /* ****************************************/

    /**
    * @param mailboxId: the id of the mailbox
    * @param serviceType: the type of service
    * @return the tabId for a mailbox and service
    */
    /*this.getWebcontentTabId = (mailboxId, serviceType) => {
      return this.webcontentTabIds.get(`${mailboxId}:${serviceType}`)
    }*/

    /**
    * @return the tab id for the active mailbox and service
    */
    /*this.getActiveWebcontentTabId = () => {
      return this.getWebcontentTabId(this.activeMailboxId(), this.activeMailboxService())
    }*/

    /**
    * @param mailboxId: the id of the mailbox
    * @param serviceType: the type of service
    * @return the metrics for the web contents or undefined if not found
    */
    /*this.getWebcontentMetrics = (mailboxId, serviceType) => { //TODO depricated. check usages
      const webContentsId = this.getWebcontentTabId(mailboxId, serviceType)
      const wc = webContentsId !== undefined ? remote.webContents.fromId(webContentsId) : undefined
      const webContentsPid = wc ? wc.getOSProcessId() : -1
      return remote.app.getAppMetrics().find((metric) => metric.pid === webContentsPid)
    }*/

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  * @return a composite key of the two
  */
  getFullServiceKey (mailboxId, serviceType) {
    return `${mailboxId}:${serviceType}`
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
  * Tries to source the user from the user store
  * @return the wire config experiments
  */
  getWireConfigExperiments () {
    const userStore = this.alt.getStore(AltUserIdentifiers.STORE_NAME)
    if (userStore) {
      return userStore.getState().wireConfigExperiments()
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

  handleLoad ({ allAvatars, allMailboxes, mailboxIndex, activeMailbox, activeService, sleepingServices }) {
    // Mailboxes
    this.index = mailboxIndex
    this.mailboxes = Object.keys(allMailboxes).reduce((acc, id) => {
      acc.set(id, MailboxFactory.modelize(id, allMailboxes[id]))
      return acc
    }, new Map())

    // Active
    this.active = activeMailbox || this.index[0] || null
    this.activeService = activeService || CoreMailbox.SERVICE_TYPES.DEFAULT

    // Sleeping
    this.sleepingServices = new Set(sleepingServices || [])

    // Avatars
    this.avatars = Object.keys(allAvatars).reduce((acc, id) => {
      acc.set(id, allAvatars[id])
      return acc
    }, new Map())
  }
}

export default CoreMailboxStore

//TODO Depricate WB_MAILBOX_STORAGE_CHANGE_ACTIVE from this.sendActiveStateToMainThread
