import MigratingStorageBucket from './MigratingStorageBucket'
import { PERSISTENCE_INDEX_KEY } from 'shared/constants'
import uuid from 'uuid'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import acmailboxauthStorage from './acmailboxauthStorage'
import acmailboxStorage from './acmailboxStorage'
import acserviceStorage from './acserviceStorage'

const CLASSIC_SERVICE_TO_NEW = {
  'TRELLO:DEFAULT': SERVICE_TYPES.TRELLO,
  'SLACK:DEFAULT': SERVICE_TYPES.SLACK,
  'GOOGLE:DEFAULT': (mailbox, service) => {
    if (service.accessMode === 'GMAIL') {
      return SERVICE_TYPES.GOOGLE_MAIL
    } else if (service.accessMode === 'GINBOX') {
      return SERVICE_TYPES.GOOGLE_INBOX
    }
  },
  'GOOGLE:CALENDAR': SERVICE_TYPES.GOOGLE_CALENDAR,
  'GOOGLE:COMMUNICATION': SERVICE_TYPES.GOOGLE_HANGOUTS,
  'GOOGLE:CONTACTS': SERVICE_TYPES.GOOGLE_CONTACTS,
  'GOOGLE:NOTES': SERVICE_TYPES.GOOGLE_KEEP,
  'GOOGLE:PHOTOS': SERVICE_TYPES.GOOGLE_PHOTOS,
  'GOOGLE:STORAGE': SERVICE_TYPES.GOOGLE_DRIVE,
  'GOOGLE:DOCS': SERVICE_TYPES.GOOGLE_DOCS,
  'GOOGLE:SHEETS': SERVICE_TYPES.GOOGLE_SHEETS,
  'GOOGLE:SLIDES': SERVICE_TYPES.GOOGLE_SLIDES,
  'GOOGLE:ANALYTICS': SERVICE_TYPES.GOOGLE_ANALYTICS,
  'GOOGLE:VIDEO': SERVICE_TYPES.GOOGLE_YOUTUBE,
  'GOOGLE:SOCIAL': SERVICE_TYPES.GOOGLE_PLUS,
  'GOOGLE:MESSENGER': SERVICE_TYPES.GOOGLE_ALLO,
  'GOOGLE:CLASSROOM': SERVICE_TYPES.GOOGLE_CLASSROOM,
  'GOOGLE:MUSIC': SERVICE_TYPES.GOOGLE_MUSIC,
  'GOOGLE:FI': SERVICE_TYPES.GOOGLE_FI,
  'GOOGLE:ADMIN': SERVICE_TYPES.GOOGLE_ADMIN,
  'GOOGLE:TEAM': SERVICE_TYPES.GOOGLE_CHAT,
  'GOOGLE:PHONE': SERVICE_TYPES.GOOGLE_VOICE,
  'MICROSOFT:DEFAULT': SERVICE_TYPES.MICROSOFT_MAIL,
  'MICROSOFT:CALENDAR': SERVICE_TYPES.MICROSOFT_CALENDAR,
  'MICROSOFT:CONTACTS': SERVICE_TYPES.MICROSOFT_CONTACTS,
  'MICROSOFT:NOTES': SERVICE_TYPES.MICROSOFT_TASKS,
  'MICROSOFT:STORAGE': SERVICE_TYPES.MICROSOFT_ONEDRIVE,
  'MICROSOFT:DOCS': SERVICE_TYPES.MICROSOFT_WORD,
  'MICROSOFT:NOTEBOOK': SERVICE_TYPES.MICROSOFT_ONENOTE,
  'MICROSOFT:SHEETS': SERVICE_TYPES.MICROSOFT_EXCEL,
  'MICROSOFT:SLIDES': SERVICE_TYPES.MICROSOFT_POWERPOINT,
  'MICROSOFT:TEAM': SERVICE_TYPES.MICROSOFT_TEAMS,
  'MICROSOFT:TASK': SERVICE_TYPES.MICROSOFT_TODO,
  'GENERIC:DEFAULT': SERVICE_TYPES.GENERIC,
  'CONTAINER:DEFAULT': SERVICE_TYPES.CONTAINER
}

class MailboxStorageBucket extends MigratingStorageBucket {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    super('mailboxes')
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads the raw mailboxes
  * @return a list of ordered mailboxes
  */
  _loadRawMailboxes () {
    const rawData = this.allJSONItems()
    const index = rawData[PERSISTENCE_INDEX_KEY] || []

    return index
      .map((id) => rawData[id])
      .filter((mb) => !!mb)
  }

  /**
  * Converts the mailbox into the new style
  * @param mailbox: the mailbox to convert
  * @param next: the next object to write into
  */
  _convertMailboxGroup (mailbox, next) {
    const mailboxAuth = this._convertMailboxAuth(mailbox)
    const nextMailbox = this._convertMailbox(mailbox)
    const nextServices = (mailbox.services || []).reduce((acc, service) => {
      const nextService = this._convertService(mailbox, service)
      acc[nextService.id] = nextService
      return acc
    }, {})

    // Push services into mailbox
    if (mailbox.serviceDisplayMode === 'TOOLBAR') {
      if (mailbox.serviceToolbarIconLayout === 'LEFT_ALIGN') {
        nextMailbox.toolbarStartServices = Object.keys(nextServices)
      } else { // Covers the default of RIGHT_ALIGN
        nextMailbox.toolbarEndServices = Object.keys(nextServices)
      }
    } else { // Covers the default of SIDEBAR
      nextMailbox.sidebarServices = Object.keys(nextServices)
    }

    // Save in the next config
    next.mailboxes[nextMailbox.id] = nextMailbox
    if (mailboxAuth) {
      next.mailboxAuths[`${mailboxAuth.parentId}:${mailboxAuth.namespace}`] = mailboxAuth
    }
    Object.keys(nextServices).forEach((serviceId) => {
      next.services[serviceId] = nextServices[serviceId]
    })
  }

  /**
  * Converts a classic mailbox to the new style mailbox. Note services and service arrangement
  * settings are not migrated
  * @param mailbox: the mailbox
  * @return the new mailbox
  */
  _convertMailbox (mailbox) {
    const nextMailbox = {
      id: mailbox.id,
      changedTime: mailbox.changedTime,
      type: mailbox.type,
      artificiallyPersistCookies: mailbox.artificiallyPersistCookies,
      defaultWindowOpenMode: mailbox.defaultWindowOpenMode,
      avatarId: mailbox.customAvatar,
      color: mailbox.color,
      showAvatarColorRing: mailbox.showAvatarColorRing,
      collapseSidebarServices: mailbox.collapseSidebarServices,
      showSleepableServiceIndicator: mailbox.showSleepableServiceIndicator,
      showBadge: mailbox.showCumulativeSidebarUnreadBadge !== undefined
        ? mailbox.showCumulativeSidebarUnreadBadge
        : mailbox.showUnreadBadge,
      badgeColor: mailbox.cumulativeSidebarUnreadBadgeColor !== undefined
        ? mailbox.cumulativeSidebarUnreadBadgeColor
        : mailbox.unreadBadgeColor
    }

    if (mailbox.type === 'CONTAINER') {
      nextMailbox.displayName = 'Container'
      nextMailbox.color = nextMailbox.color || 'rgb(255, 255, 255)'
      nextMailbox.useCustomUserAgent = mailbox.useCustomUserAgent
      nextMailbox.customUserAgentString = mailbox.customUserAgentString
      nextMailbox.openGoogleDriveLinksWithExternalBrowser = (mailbox.windowOpenUserConfig || {}).googledrive === true
    } else if (mailbox.type === 'GENERIC') {
      nextMailbox.displayName = 'Weblink'
      nextMailbox.color = nextMailbox.color || '#2ecc71'
      nextMailbox.useCustomUserAgent = mailbox.useCustomUserAgent
      nextMailbox.customUserAgentString = mailbox.customUserAgentString
    } else if (mailbox.type === 'GOOGLE') {
      nextMailbox.displayName = 'Google'
      const service = (mailbox.services || []).find((s) => s.type === 'DEFAULT')
      if (service.accessMode === 'GMAIL') {
        nextMailbox.color = nextMailbox.color || 'rgb(220, 75, 75)'
      } else if (service.accessMode === 'GINBOX') {
        nextMailbox.color = nextMailbox.color || 'rgb(66, 133, 244)'
      }
      nextMailbox.openGoogleDriveLinksWithExternalBrowser = mailbox.openDriveLinksWithExternalBrowser !== undefined
        ? mailbox.openDriveLinksWithExternalBrowser
        : mailbox.openDriveLinksWithDefaultOpener
    } else if (mailbox.type === 'MICROSOFT') {
      if (mailbox.accessMode === 'OUTLOOK') {
        nextMailbox.displayName = 'Outlook'
        nextMailbox.color = nextMailbox.color || '#0078d7'
      } else if (mailbox.accessMode === 'OFFICE365') {
        nextMailbox.displayName = 'Office 365'
        nextMailbox.color = nextMailbox.color || 'rgb(237, 70, 47)'
      }
    } else if (mailbox.type === 'SLACK') {
      nextMailbox.displayName = 'Slack'
      nextMailbox.color = nextMailbox.color || 'rgb(102, 187, 152)'
    } else if (mailbox.type === 'TRELLO') {
      nextMailbox.displayName = 'Trello'
      nextMailbox.color = nextMailbox.color || 'rgb(33, 108, 167)'
    }

    return JSON.parse(JSON.stringify(nextMailbox)) // Remove undefined
  }

  /**
  * Converts a classic mailbox to the new style auth
  * @param mailbox: the parent mailbox
  * @return the new auth
  */
  _convertMailboxAuth (mailbox) {
    if (mailbox.type === 'CONTAINER') {
      return undefined
    } else if (mailbox.type === 'GENERIC') {
      return undefined
    } else if (mailbox.type === 'GOOGLE') {
      return JSON.parse(JSON.stringify({
        namespace: 'com.google',
        parentId: mailbox.id,
        isAuthInvalid: (mailbox.auth || {}).isInvalid === true,
        hasAuth: !!mailbox.auth,
        authData: mailbox.auth
      }))
    } else if (mailbox.type === 'MICROSOFT') {
      const storageService = (mailbox.services || []).find((s) => s.type === 'STORAGE')
      return JSON.parse(JSON.stringify({
        namespace: 'com.microsoft',
        parentId: mailbox.id,
        isAuthInvalid: false,
        hasAuth: !!mailbox.auth,
        authData: {
          ...mailbox.auth,
          driveUrl: (storageService || {}).driveUrl
        }
      }))
    } else if (mailbox.type === 'SLACK') {
      return JSON.parse(JSON.stringify({
        namespace: 'com.slack',
        parentId: mailbox.id,
        isAuthInvalid: (mailbox.auth || {}).isInvalid === true,
        hasAuth: !!mailbox.auth,
        authData: mailbox.auth
      }))
    } else if (mailbox.type === 'TRELLO') {
      return JSON.parse(JSON.stringify({
        namespace: 'com.trello',
        parentId: mailbox.id,
        isAuthInvalid: false,
        hasAuth: !!(mailbox.authToken && mailbox.authAppKey),
        authData: {
          authToken: mailbox.authToken,
          authAppKey: mailbox.authAppKey
        }
      }))
    }
  }

  /**
  * Converts a classic service to the new style
  * @param mailbox: the parent mailbox
  * @param service: the service
  * @return the new service
  */
  _convertService (mailbox, service) {
    const fqClassicType = `${mailbox.type}:${service.type}`
    const nextService = {
      id: uuid.v4(),
      type: typeof (CLASSIC_SERVICE_TO_NEW[fqClassicType]) === 'function'
        ? CLASSIC_SERVICE_TO_NEW[fqClassicType](mailbox, service)
        : CLASSIC_SERVICE_TO_NEW[fqClassicType],
      parentId: mailbox.id,
      sleepable: service.sleepable,
      sleepableTimeout: service.sleepableTimeout,
      hasSeenSleepableWizard: service.hasSeenSleepableWizard,
      restoreLastUrl: service.restoreLastUrl,
      badgeColor: service.unreadBadgeColor !== undefined
        ? service.unreadBadgeColor
        : mailbox.unreadBadgeColor,
      showBadgeCount: service.showUnreadBadge !== undefined
        ? service.showUnreadBadge
        : service.type === 'DEFAULT' ? mailbox.showUnreadBadge : undefined,
      showBadgeCountInApp: service.unreadCountsTowardsAppUnread !== undefined
        ? service.unreadCountsTowardsAppUnread
        : service.type === 'DEFAULT' ? mailbox.unreadCountsTowardsAppUnread : undefined,
      showBadgeActivity: service.showUnreadActivityBadge !== undefined
        ? service.showUnreadActivityBadge
        : service.type === 'DEFAULT' ? mailbox.showUnreadActivityBadge : undefined,
      showBadgeActivityInApp: service.unreadActivityCountsTowardsAppUnread !== undefined
        ? service.unreadActivityCountsTowardsAppUnread
        : service.type === 'DEFAULT' ? mailbox.unreadActivityCountsTowardsAppUnread : undefined,
      showNotifications: service.showNotifications !== undefined
        ? service.showNotifications
        : service.type === 'DEFAULT' ? mailbox.showNotifications : undefined,
      showAvatarInNotifications: service.showAvatarInNotifications !== undefined
        ? service.showAvatarInNotifications
        : mailbox.showAvatarInNotifications,
      notificationsSound: service.notificationsSound !== undefined
        ? service.notificationsSound
        : mailbox.notificationsSound,
      customCSS: service.customCSS,
      customJS: service.customJS,
      serviceAvatarURL: mailbox.avatar,
      serviceLocalAvatarId: mailbox.serviceLocalAvatar
    }

    if (service.type === 'DEFAULT') {
      if (mailbox.type === 'CONTAINER') {
        nextService.containerId = (mailbox.container || {}).id
        nextService.container = mailbox.container
        nextService.urlSubdomain = mailbox.urlSubdomain
        nextService.hasNavigationToolbar = service.hasNavigationToolbar
      } else if (mailbox.type === 'GENERIC') {
        nextService.usePageThemeAsColor = mailbox.usePageThemeAsColor
        nextService.usePageTitleAsDisplayName = mailbox.usePageTitleAsDisplayName
        nextService.hasNavigationToolbar = service.hasNavigationToolbar
        nextService.supportsWBGAPI = service.supportsGuestConfig
      } else if (mailbox.type === 'GOOGLE') {
        nextService.serviceDisplayName = mailbox.email
        nextService.customUnreadQuery = service.customUnreadQuery
        nextService.customUnreadLabelWatchString = service.customUnreadLabelWatchString
        nextService.customUnreadCountFromLabel = service.customUnreadCountFromLabel
        nextService.customUnreadCountLabel = service.customUnreadCountLabel
        nextService.customUnreadCountLabelField = service.customUnreadCountLabelField
        nextService.unreadMode = service.unreadMode
      } else if (mailbox.type === 'MICROSOFT') {
        nextService.email = mailbox.email
        nextService.userFullName = mailbox.userFullName
        nextService.userId = mailbox.userId
      } else if (mailbox.type === 'SLACK') {
        nextService.selfOverview = mailbox.selfOverview
        nextService.teamOverview = mailbox.teamOverview
        nextService.authTeamName = (mailbox.auth || {}).authTeamName
        nextService.authUserId = (mailbox.auth || {}).authUserId
      } else if (mailbox.type === 'TRELLO') {
        nextService.email = mailbox.email
        nextService.username = mailbox.username
        nextService.fullName = mailbox.fullName
        nextService.initials = mailbox.initials
        nextService.homeBoardId = service.homeBoardId
        nextService.boards = service.boards
      }
    }

    return JSON.parse(JSON.stringify(nextService)) // Remove undefined
  }

  /* ****************************************************************************/
  // Migration
  /* ****************************************************************************/

  /**
  * Starts the migration
  * @return true if migration happend, false otherwise
  */
  startMigration () {
    console.log("MIGRATE START")
    if (!this.hasDataToImport) { return false }

    const prevMailboxes = this._loadRawMailboxes()
    const nextMailboxIndex = prevMailboxes.map((mb) => mb.id)
    const next = {
      mailboxes: {},
      mailboxAuths: {},
      services: {}
    }
    prevMailboxes.forEach((mailbox) => { this._convertMailboxGroup(mailbox, next) })
return
    acmailboxauthStorage.removeAllItems()
    acmailboxauthStorage.setJSONItems(next.mailboxAuths)
    acserviceStorage.removeAllItems()
    acserviceStorage.setJSONItems(next.services)
    acmailboxStorage.removeAllItems()
    acmailboxStorage.setJSONItems(next.mailboxes)
    acmailboxStorage.setJSONItem(PERSISTENCE_INDEX_KEY, nextMailboxIndex)

    this.finishMigration()
    console.log("MIGRATE END")
    return true
  }
}

export default new MailboxStorageBucket()
