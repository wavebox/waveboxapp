import MigratingStorageBucket from './MigratingStorageBucket'
import { PERSISTENCE_INDEX_KEY } from 'shared/constants'
import uuid from 'uuid'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import acmailboxauthStorage from './acmailboxauthStorage'
import acmailboxStorage from './acmailboxStorage'
import acserviceStorage from './acserviceStorage'
import ClassicMailboxFactory from 'shared/Models/Classic/Accounts/MailboxFactory'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ServiceFactory from 'shared/Models/ACAccounts/ServiceFactory'
import AuthFactory from 'shared/Models/ACAccounts/AuthFactory'
import fs from 'fs-extra'
import { USER } from 'shared/Models/DeviceKeys'
import userStorage from './userStorage'

const MIGRATION_PRINT_EXTRA = false
const CLASSIC_SERVICE_TYPE_TO_NEW = {
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

const CLASSIC_MAILBOX_TO_TEMPLATE = {
  'TRELLO': () => 'TRELLO',
  'SLACK': () => 'SLACK',
  'GOOGLE': (mb) => {
    const sv = (mb.services || []).find((s) => s.type === 'DEFAULT')
    if (sv && sv.accessMode === 'GMAIL') {
      return 'GOOGLE_MAIL'
    } else if (sv && sv.accessMode === 'GINBOX') {
      return 'GOOGLE_INBOX'
    }
  },
  'MICROSOFT': (mb) => {
    if (mb.accessMode === 'OUTLOOK') {
      return 'OUTLOOK'
    } else if (mb.accessMode === 'OFFICE365') {
      return 'OFFICE365'
    }
  },
  'GENERIC': () => 'GENERIC',
  'CONTAINER': () => 'CONTAINER'
}

const CLASSIC_MAILBOX_KEY_TO_NEW = {
  cumulativeSidebarUnreadBadgeColor: 'badgeColor',
  showCumulativeSidebarUnreadBadge: 'showBadge'
}
const CLASSIC_MAILBOX_KEY_TO_AUTH = {
  authAppKey: [new Set(['TRELLO']), 'authAppKey'],
  authToken: [new Set(['TRELLO', 'SLACK']), 'authToken'],
  authTeamId: [new Set(['SLACK']), 'authTeamId'],
  authTeamName: [new Set(['SLACK']), 'authTeamName'],
  authUserId: [new Set(['SLACK']), 'authUserId'],
  authUserName: [new Set(['SLACK']), 'authUserName'],
  authUrl: [new Set(['SLACK']), 'authUrl'],
  authPushToken: [new Set(['GOOGLE']), 'pushToken'],
  authEmail: [new Set(['GOOGLE']), 'authEmail'],
  authExpiryTime: [new Set(['GOOGLE', 'MICROSOFT']), 'authExpiryTime'],
  refreshToken: [new Set(['GOOGLE', 'MICROSOFT']), 'refreshToken'],
  accessToken: [new Set(['GOOGLE', 'MICROSOFT']), 'accessToken'],
  authTime: [new Set(['GOOGLE', 'MICROSOFT']), 'authTime'],
  authProtocolVersion: [new Set(['MICROSOFT']), 'authProtocolVersion']
}
const CLASSIC_MAILBOX_KEY_TO_SERVICE = {
  urlSubdomain: 'urlSubdomain',
  hasServiceLocalAvatar: 'hasServiceLocalAvatarId',
  displayName: 'displayName',
  containerId: [new Set(['CONTAINER']), 'containerId'],
  container: [new Set(['CONTAINER']), 'container'],
  avatarCharacterDisplay: [new Set(['TRELLO']), 'serviceAvatarCharacterDisplay'],
  initials: [new Set(['TRELLO']), 'initials'],
  fullName: [new Set(['TRELLO']), 'fullName'],
  username: [new Set(['TRELLO']), 'username'],
  email: [new Set(['TRELLO', 'GOOGLE', 'MICROSOFT']), 'serviceDisplayName'],
  hasTeamOverview: [new Set(['SLACK']), 'hasTeamOverview'],
  teamOverview: [new Set(['SLACK']), 'teamOverview'],
  hasSelfOverview: [new Set(['SLACK']), 'hasSelfOverview'],
  selfOverview: [new Set(['SLACK']), 'selfOverview'],
  avatarURL: 'serviceAvatarURL',
  customAvatarId: 'avatarId',
  hasCustomAvatar: 'hasAvatarId',
  usePageThemeAsColor: [new Set(['GENERIC']), 'usePageThemeAsColor'],
  usePageTitleAsDisplayName: [new Set(['GENERIC']), 'usePageTitleAsDisplayName'],
  userFullName: [new Set(['MICROSOFT']), 'userFullName'],
  userId: [new Set(['MICROSOFT']), 'userId']
}
const CLASSIC_MAILBOX_KEY_DEPRICATED = new Set([
  'supportsAuth',
  'serviceToolbarIconLayout',
  'serviceDisplayMode',
  'additionalServices',
  'defaultService',
  'additionalServiceTypes',
  'hasAdditionalServices',
  'disabledServiceTypes',
  'enabledServiceTypes',
  'enabledServices',
  'supportsAdditionalServiceTypes',
  'defaultServiceTypes',
  'supportedServiceTypes',
  'supportsWaveboxAuth',
  'isIntegrated',
  'partition',
  'type',
  'humanizedUnreadItemType',
  'humanizedLogo',
  'humanizedLogos',
  'humanizedType',
  'containerVersion', // Container
  'windowOpenUserConfig', // Container
  'enabledWindowOpenOverrideConfigs', // Container
  'isAuthenticationInvalid', // Inconsistent across classic types
  'hasAuth', // Inconsistent across classic types
  'pageThemeColor', // Generic
  'pageTitle', // Generic
  'ACCESS_MODES', // Microsoft
  'accessMode' // Microsoft
])
const CLASSIC_MAILBOX_KEY_SKIP = new Set([
  'userDisplayName', // Container
  'auth', // Slack, Google, Microsoft
  'color' // We don't have a default here anymore which causes spurous errors -just skip
])
const CLASSIC_MAILBOX_KEY_TO_CONTAINER = {
  hasUrlSubdomain: 'hasUrlSubdomain'
}
const CLASSIC_SERVICE_KEY_TO_NEW = {
  showUnreadBadge: 'showBadgeCount',
  unreadCountsTowardsAppUnread: 'showBadgeCountInApp',
  showUnreadActivityBadge: 'showBadgeActivity',
  unreadActivityCountsTowardsAppUnread: 'showBadgeActivityInApp',
  unreadBadgeColor: 'badgeColor',
  supportsGuestConfig: 'supportsWBGAPI'
}
const CLASSIC_SERVICE_KEY_TO_CONTAINER = {
  documentTitleUnreadBlinks: 'documentTitleUnreadBlinks',
  documentTitleHasUnread: 'documentTitleHasUnread',
  useAsyncAlerts: 'useAsyncAlerts',
  html5NotificationsGenerateUnreadActivity: 'html5NotificationsGenerateUnreadActivity'
}
const CLASSIC_SERVICE_KEY_DEPRICATED = new Set([
  'notifications',
  'trayMessages',
  'supportedProtocols',
  'supportsCompose',
  'lastUrl',
  'hasUnreadActivity',
  'unreadCount',
  'mergeChangesetOnActive',
  'restoreLastUrlDefault',
  'containerService',
  'unreadNotifications',
  'slackUnreadIMInfo', // Slack
  'slackUnreadMPIMInfo', // Slack
  'slackUnreadGroupInfo', // Slack
  'slackUnreadChannelInfo', // Slack
  'unreadThreadsIndexed', // Google
  'unreadThreads', // Google
  'hasHistoryId', // Google
  'historyId', // Google
  'accessMode', // Google
  'teamName', // Slack
  'depricatedOpenWindowsExternally', // Generic
  'unreadMessages', // Microsoft
  'ACCESS_MODES' // Microsoft
])
const CLASSIC_SERVICE_KEY_SKIP = { // keys we're just not checking
  'type': true,
  'restorableUrl': true,
  'guestConfig': true,
  'humanizedType': 'MICROSOFT:DEFAULT',
  'humanizedUnreadItemType': true, // We updated these to be more natural
  'humanizedLogo': true,
  'humanizedLogos': true,
  'humanizedTypeShort': true,
  'unreadCountUpdateTime': 'GOOGLE:COMMUNICATION',
  'url': true // Slack & Office365 work slightly differently now meaning .url is different
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

    const stripNonDefaultServices = this._loadStripNonDefaultServices()

    return index
      .map((id) => rawData[id])
      .filter((mb) => !!mb)
      .map((mb) => {
        if (stripNonDefaultServices) {
          return {
            ...mb,
            services: (mb.services || []).filter((svc) => svc.type === 'DEFAULT')
          }
        } else {
          return mb
        }
      })
  }

  /**
  * Loads the skeleton user object and checks if they definately don't have services
  * @return true if they don't have services
  */
  _loadStripNonDefaultServices () {
    const user = userStorage.getJSONItem(USER)
    if (!user) { return false }
    if (user.hasServices === false) { return true }
    return false
  }

  /* ****************************************************************************/
  // Modelizing
  /* ****************************************************************************/

  /**
  * Validates the migration
  * @param prevMailboxesJS: the previous mailboxes as a list
  * @param nextJS: the next object
  * @return { prevMailboxes, next }
  */
  _modelizeForValidation (prevMailboxesJS, nextJS) {
    const prevMailboxes = prevMailboxesJS.map((js) => {
      const mailbox = ClassicMailboxFactory.modelize(js.id, js)
      return {
        mailbox: mailbox,
        services: mailbox.enabledServices
      }
    })
    const nextMailboxes = nextJS.mailboxIndex.map((mailboxId) => {
      const mailbox = new ACMailbox(nextJS.mailboxes[mailboxId])
      const authId = Object.keys(nextJS.mailboxAuths).find((k) => k.startsWith(mailboxId))
      return {
        mailbox: mailbox,
        auth: AuthFactory.modelizeAuth(nextJS.mailboxAuths[authId] || { hasAuth: true }),
        services: mailbox.allServices.map((serviceId) => {
          return ServiceFactory.modelizeService(nextJS.services[serviceId])
        })
      }
    })

    return { prevMailboxes, nextMailboxes }
  }

  /**
  * Gets all the non-function instance properties from a model
  * @param model: the model
  * @return a list of prop names
  */
  _allModelProps (model) {
    const systemKeys = new Set([
      '__proto__'
    ])
    let propNames = []
    let insp = model.constructor.prototype
    while (insp !== null) {
      const names = Object.getOwnPropertyNames(insp)
        .filter((n) => typeof (model[n]) !== 'function')
        .filter((n) => !systemKeys.has(n))
      propNames = propNames.concat(names)
      insp = Object.getPrototypeOf(insp)
    }

    return Array.from(new Set(propNames))
  }

  /**
  * Checks if two model props compare
  * @param a: prop a
  * @param b: prop b
  * @return true if they equal each other or they json stringify to each other
  */
  _modelPropsCompare (a, b) {
    if (a === b) { return true }
    if (JSON.stringify(a) === JSON.stringify(b)) { return true }
    if (typeof (a) === 'object' && typeof (a.cloneData) === 'function' && typeof (b) === 'object' && typeof (b.cloneData) === 'function') {
      if (JSON.stringify(a.cloneData()) === JSON.stringify(b.cloneData())) { return true }
    }
    return false
  }

  /* ****************************************************************************/
  // Converting
  /* ****************************************************************************/

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
      templateType: CLASSIC_MAILBOX_TO_TEMPLATE[mailbox.type]
        ? CLASSIC_MAILBOX_TO_TEMPLATE[mailbox.type](mailbox)
        : undefined,
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
      nextMailbox.displayName = mailbox.container.name || 'Container'
      nextMailbox.useCustomUserAgent = mailbox.useCustomUserAgent
      nextMailbox.customUserAgentString = mailbox.customUserAgentString
      nextMailbox.openGoogleDriveLinksWithExternalBrowser = (mailbox.windowOpenUserConfig || {}).googledrive === true
    } else if (mailbox.type === 'GENERIC') {
      nextMailbox.displayName = 'Weblink'
      nextMailbox.useCustomUserAgent = mailbox.useCustomUserAgent
      nextMailbox.customUserAgentString = mailbox.customUserAgentString
    } else if (mailbox.type === 'GOOGLE') {
      nextMailbox.displayName = 'Google'
      nextMailbox.openGoogleDriveLinksWithExternalBrowser = mailbox.openDriveLinksWithExternalBrowser !== undefined
        ? mailbox.openDriveLinksWithExternalBrowser
        : mailbox.openDriveLinksWithDefaultOpener
    } else if (mailbox.type === 'MICROSOFT') {
      if (mailbox.accessMode === 'OUTLOOK') {
        nextMailbox.displayName = 'Outlook'
      } else if (mailbox.accessMode === 'OFFICE365') {
        nextMailbox.displayName = 'Office 365'
      }
    } else if (mailbox.type === 'SLACK') {
      nextMailbox.displayName = 'Slack'
    } else if (mailbox.type === 'TRELLO') {
      nextMailbox.displayName = 'Trello'
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
          isPersonalAccount: mailbox.accessMode === 'OUTLOOK',
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
      type: typeof (CLASSIC_SERVICE_TYPE_TO_NEW[fqClassicType]) === 'function'
        ? CLASSIC_SERVICE_TYPE_TO_NEW[fqClassicType](mailbox, service)
        : CLASSIC_SERVICE_TYPE_TO_NEW[fqClassicType],
      parentId: mailbox.id,
      // Default servies used to have the default getter as false. This was then migrated messily for new and old accounts so handle that
      sleepable: service.sleepable === undefined && mailbox.type !== 'CONTAINER' && service.type === 'DEFAULT'
        ? false
        : service.sleepable,
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
      customJS: service.customJS
    }

    if (service.type === 'DEFAULT') {
      nextService.serviceAvatarURL = mailbox.avatar
      nextService.serviceLocalAvatarId = mailbox.serviceLocalAvatar
      nextService.avatarId = mailbox.customAvatar

      if (mailbox.type === 'CONTAINER') {
        nextService.containerId = (mailbox.container || {}).id
        nextService.container = mailbox.container
        nextService.urlSubdomain = mailbox.urlSubdomain
        nextService.hasNavigationToolbar = service.hasNavigationToolbar
      } else if (mailbox.type === 'GENERIC') {
        nextService.usePageThemeAsColor = mailbox.usePageThemeAsColor
        nextService.usePageTitleAsDisplayName = mailbox.usePageTitleAsDisplayName
        nextService.displayName = (mailbox.usePageTitleAsDisplayName ? mailbox.pageTitle : undefined) || mailbox.displayName
        nextService.hasNavigationToolbar = service.hasNavigationToolbar
        nextService.supportsWBGAPI = service.supportsGuestConfig
        nextService.url = service.url
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
        if (mailbox.accessMode === 'OUTLOOK') {
          nextService.serviceAvatarURL = `https://apis.live.net/v5.0/${mailbox.userId}/picture?type=large`
        }
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
  // Validating
  /* ****************************************************************************/

  /**
  * Validates the migration
  * @param prevMailboxesJS: the previous mailboxes
  * @param nextJS: the next object
  * @return an array of warnings
  */
  _validateMigration (prevMailboxesJS, nextJS) {
    const report = []
    try {
      const { prevMailboxes, nextMailboxes } = this._modelizeForValidation(prevMailboxesJS, nextJS)

      // Do some structural checking
      if (prevMailboxes.length !== nextMailboxes.length) {
        report.push({ level: 'fatal', message: `Mailbox counts are not equal ${prevMailboxes.length} !== ${nextMailboxes.length}` })
        return report
      }

      // Build the mailboxes array
      const mailboxes = prevMailboxes.map((p, i) => {
        return [p, nextMailboxes[i]]
      })

      // Do some more structural checking
      let serviceCountCheckFail = false
      mailboxes.forEach(([prev, next]) => {
        if (prev.services.length !== next.services.length) {
          report.push({ level: 'fatal', ctx: prev.mailbox.id, message: `Service counts are not equal ${prev.services.length} !== ${next.services.length}` })
          serviceCountCheckFail = true
        }
      })
      if (serviceCountCheckFail) { return report }

      // Check the props
      mailboxes.forEach(([prev, next]) => {
        this._allModelProps(prev.mailbox).forEach((prevK) => {
          if (CLASSIC_MAILBOX_KEY_TO_AUTH[prevK]) {
            let authK
            if (Array.isArray(CLASSIC_MAILBOX_KEY_TO_AUTH[prevK])) {
              if (CLASSIC_MAILBOX_KEY_TO_AUTH[prevK][0].has(prev.mailbox.type)) {
                authK = CLASSIC_MAILBOX_KEY_TO_AUTH[prevK][1]
              }
            } else {
              authK = CLASSIC_MAILBOX_KEY_TO_AUTH[prevK]
            }

            if (authK) {
              if (!this._modelPropsCompare(prev.mailbox[prevK], next.auth[authK])) {
                report.push({
                  level: 'error',
                  ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
                  message: `Mailbox Auth value is not equal for key ${prevK}`,
                  extra: [prev.mailbox[prevK], next.auth[authK]]
                })
              } else {
                report.push({
                  level: 'pass',
                  ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
                  message: `Mailbox Auth value is equal for key ${prevK}`
                })
              }
              return
            }
          }

          if (CLASSIC_MAILBOX_KEY_TO_SERVICE[prevK]) {
            let serviceK
            if (Array.isArray(CLASSIC_MAILBOX_KEY_TO_SERVICE[prevK])) {
              if (CLASSIC_MAILBOX_KEY_TO_SERVICE[prevK][0].has(prev.mailbox.type)) {
                serviceK = CLASSIC_MAILBOX_KEY_TO_SERVICE[prevK][1]
              }
            } else {
              serviceK = CLASSIC_MAILBOX_KEY_TO_SERVICE[prevK]
            }

            if (serviceK) {
              if (!this._modelPropsCompare(prev.mailbox[prevK], next.services[0][serviceK])) {
                report.push({
                  level: 'error',
                  ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
                  message: `Mailbox Service value is not equal for key ${prevK}`,
                  extra: [prev.mailbox[prevK], next.services[0][serviceK]]
                })
              } else {
                report.push({
                  level: 'pass',
                  ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
                  message: `Mailbox Service value is equal for key ${prevK}`
                })
              }
              return
            }
          }

          if (CLASSIC_MAILBOX_KEY_TO_CONTAINER[prevK]) {
            const containerK = CLASSIC_MAILBOX_KEY_TO_CONTAINER[prevK]
            if (!this._modelPropsCompare(prev.mailbox[prevK], next.services[0].container[containerK])) {
              report.push({
                level: 'error',
                ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
                message: `Mailbox Service value is not equal for key ${prevK}`,
                extra: [prev.mailbox[prevK], next.services[0].container[containerK]]
              })
            } else {
              report.push({
                level: 'pass',
                ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
                message: `Mailbox Service value is equal for key ${prevK}`
              })
            }
            return
          }

          if (CLASSIC_MAILBOX_KEY_DEPRICATED.has(prevK)) { return }
          if (CLASSIC_MAILBOX_KEY_SKIP.has(prevK)) { return }
          const nextK = CLASSIC_MAILBOX_KEY_TO_NEW[prevK] || prevK
          if (!this._modelPropsCompare(prev.mailbox[prevK], next.mailbox[nextK])) {
            report.push({
              level: 'error',
              ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
              message: `Mailbox value is not equal for key ${prevK}`,
              extra: [prev.mailbox[prevK], next.mailbox[nextK]]
            })
          } else {
            report.push({
              level: 'pass',
              ctx: `${prev.mailbox.id}:${prev.mailbox.type}`,
              message: `Mailbox value is equal for key ${prevK}`
            })
          }
        })
        prev.services.map((prevService, index) => {
          const nextService = next.services[index]
          this._allModelProps(prevService).forEach((prevK) => {
            if (CLASSIC_SERVICE_KEY_TO_CONTAINER[prevK]) {
              const containerK = CLASSIC_SERVICE_KEY_TO_CONTAINER[prevK]
              if (!this._modelPropsCompare(prevService[prevK], nextService.container[containerK])) {
                report.push({
                  level: 'error',
                  ctx: `${prev.mailbox.id}:${prev.mailbox.type}:${prevService.type}`,
                  message: `Service container value is not equal for key ${prevK}`,
                  extra: [prevService[prevK], nextService.container[containerK]]
                })
              } else {
                report.push({
                  level: 'pass',
                  ctx: `${prev.mailbox.id}:${prev.mailbox.type}:${prevService.type}`,
                  message: `Service container value is equal for key ${prevK}`
                })
              }
              return
            }

            if (CLASSIC_SERVICE_KEY_DEPRICATED.has(prevK)) { return }
            if (CLASSIC_SERVICE_KEY_SKIP[prevK] === true) { return }
            if (CLASSIC_SERVICE_KEY_SKIP[prevK] === `${prev.mailbox.type}:${prevService.type}`) { return }
            const nextK = CLASSIC_SERVICE_KEY_TO_NEW[prevK] || prevK
            if (!this._modelPropsCompare(prevService[prevK], nextService[nextK])) {
              report.push({
                level: 'error',
                ctx: `${prev.mailbox.id}:${prev.mailbox.type}:${prevService.type}`,
                message: `Service value is not equal for key ${prevK}`,
                extra: [prevService[prevK], nextService[nextK]]
              })
            } else {
              report.push({
                level: 'pass',
                ctx: `${prev.mailbox.id}:${prev.mailbox.type}:${prevService.type}`,
                message: `Service value is equal for key ${prevK}`
              })
            }
          })
        })
      })

      return report
    } catch (ex) {
      report.push({ level: 'fatal', message: `Failed to generate report` })
      return report
    }
  }

  /**
  * Generates a migration report and outputs to disk
  * @param prevMailbox: the previous set of mailboxes
  * @param next: the next set of mailboxes
  */
  _generateMigrationReport (prevMailboxes, next) {
    try {
      const migrationReport = this._validateMigration(prevMailboxes, next)
      const {pass, fail} = migrationReport.reduce((acc, l) => {
        if (l.level === 'pass') {
          acc.pass++
        } else {
          acc.fail++
        }
        return acc
      }, { pass: 0, fail: 0 })

      const str = [
        `Timestamp: ${new Date()}`,
        `Mailboxes: ${prevMailboxes.length}`,
        `Pass: ${pass}`,
        `Fail: ${fail}`,
        '-------------------------',
        '',
        ''
      ].concat(migrationReport.map((l) => {
        let extra = MIGRATION_PRINT_EXTRA
          ? (l.extra ? '\n  >' + l.extra.join('\n  >') : '')
          : ''
        return `[${l.level.toUpperCase()}][${l.ctx}]${l.message}${extra}`
      })).join('\n')
      fs.writeFileSync(this.logPath, str)
    } catch (ex) {
      /* no-op */
    }
  }

  /* ****************************************************************************/
  // Migration
  /* ****************************************************************************/

  /**
  * Starts the migration
  * @return true if migration happend, false otherwise
  */
  startMigration () {
    if (!this.hasDataToImport) { return false }

    const prevMailboxes = this._loadRawMailboxes()
    const next = {
      mailboxIndex: prevMailboxes.map((mb) => mb.id),
      mailboxes: {},
      mailboxAuths: {},
      services: {}
    }
    prevMailboxes.forEach((mailbox) => { this._convertMailboxGroup(mailbox, next) })

    this._generateMigrationReport(prevMailboxes, next)

    acmailboxauthStorage.removeAllItems()
    acmailboxauthStorage.setJSONItems(next.mailboxAuths)
    acserviceStorage.removeAllItems()
    acserviceStorage.setJSONItems(next.services)
    acmailboxStorage.removeAllItems()
    acmailboxStorage.setJSONItems(next.mailboxes)
    acmailboxStorage.setJSONItem(PERSISTENCE_INDEX_KEY, next.mailboxIndex)

    this.finishMigration()
    return true
  }
}

export default new MailboxStorageBucket()
