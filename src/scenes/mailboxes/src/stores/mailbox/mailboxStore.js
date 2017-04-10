const alt = require('../alt')
const actions = require('./mailboxActions')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const MailboxFactory = require('shared/Models/Accounts/MailboxFactory')
const mailboxPersistence = require('./mailboxPersistence')
const avatarPersistence = require('./avatarPersistence')
const userStore = require('../user/userStore')
const { PERSISTENCE_INDEX_KEY } = require('shared/constants')
const { BLANK_PNG } = require('shared/b64Assets')
const { ipcRenderer } = window.nativeRequire('electron')
const uuid = require('uuid')
const googleActions = require('../google/googleActions')
const GoogleHTTP = require('../google/GoogleHTTP')
const slackActions = require('../slack/slackActions')
const SlackHTTP = require('../slack/SlackHTTP')
const trelloActions = require('../trello/trelloActions')
const MicrosoftHTTP = require('../microsoft/MicrosoftHTTP')
const microsoftActions = require('../microsoft/microsoftActions')
const { credentials } = require('R/Bootstrap')
const {
  Google: { GoogleMailbox, GoogleDefaultService },
  Slack: { SlackMailbox },
  Trello: { TrelloMailbox },
  Microsoft: { MicrosoftMailbox },
  Generic: { GenericMailbox }
} = require('shared/Models/Accounts')

const AUTH_MODES = {
  CREATE: 'CREATE',
  REAUTHENTICATE: 'REAUTHENTICATE'
}

class MailboxStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.index = []
    this.mailboxes = new Map()
    this.avatars = new Map()
    this.snapshots = new Map()
    this.active = null
    this.activeService = CoreMailbox.SERVICE_TYPES.DEFAULT
    this.search = new Map()

    /* ****************************************/
    // Mailboxes
    /* ****************************************/

    /**
    * @return all the mailboxes in order
    */
    this.allMailboxes = () => { return this.index.map((id) => this.mailboxes.get(id)) }

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
    this.mailboxIds = () => { return Array.from(this.index) }

    /**
    * @return the mailbox
    */
    this.getMailbox = (id) => { return this.mailboxes.get(id) || null }

    /**
    * @return the count of mailboxes
    */
    this.mailboxCount = () => { return this.mailboxes.size }

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

    /* ****************************************/
    // Mailbox Restrictions
    /* ****************************************/

    /**
    * @param id: the mailbox id
    * @param user: the current user object
    * @return true if the mailbox is restricted, false otherwise
    */
    this.isMailboxRestricted = (id, user) => {
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
    * @param user: the current user object
    * @return a list of unrestricted mailbox ids
    */
    this.unrestrictedMailboxIds = (user) => {
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
    * @param user: the curent user object
    * @return true if the user can add a mailbox, false otherwise
    */
    this.canAddUnrestrictedMailbox = (user) => {
      return this.unrestrictedMailboxIds(user).length < user.accountLimit
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
      return this.allServices().filter((service) => service.supportsCompose)
    }

    /**
    * @param protocol: the protocol to get services for
    * @return an array of services that support the given protocol
    */
    this.getServicesSupportingProtocol = (protocol) => {
      return this.allServices().filter((service) => service.supportedProtocols.has(protocol))
    }

    /* ****************************************/
    // Avatar
    /* ****************************************/

    /**
    * @param id: the id of the mailbox
    * @return the avatar base64 string or a blank png string
    */
    this.getAvatar = (id) => { return this.avatars.get(id) || BLANK_PNG }

    /* ****************************************/
    // Snapshots
    /* ****************************************/

    /**
    * @param id: the id of the mailbox
    * @param service: the type of service
    * @return the snapshot base64 string
    */
    this.getSnapshot = (id, service) => { return this.snapshots.get(`${id}:${service}`) }

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
    this.activeMailbox = () => { return this.mailboxes.get(this.active) }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the type of service
    * @return true if this mailbox is active, false otherwise
    */
    this.isActive = (mailboxId, service) => {
      return this.activeMailboxId() === mailboxId && this.activeMailboxService() === service
    }

    /* ****************************************/
    // Search
    /* ****************************************/

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return true if the mailbox is searching, false otherwise
    */
    this.isSearchingMailbox = (mailboxId, service) => {
      return this.search.get(`${mailboxId}:${service}`) === true
    }

    /* ****************************************/
    // Unread
    /* ****************************************/

    /**
    * @return the total amount of unread items
    */
    this.totalUnreadCount = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        if (mailbox) {
          acc += mailbox.unreadCount
        }
        return acc
      }, 0)
    }

    /**
    * @return the total amount of unread items taking mailbox settings into account
    */
    this.totalUnreadCountForAppBadge = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        if (mailbox && mailbox.unreadCountsTowardsAppUnread) {
          acc += mailbox.unreadCount
        }
        return acc
      }, 0)
    }

    /**
    * @return true if any mailboxes have another unread info status, taking settings into account
    */
    this.hasOtherUnreadForAppBadge = () => {
      return !!this.allMailboxes().find((mailbox) => {
        return mailbox && mailbox.unreadCountsTowardsAppUnread && mailbox.hasOtherUnread
      })
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Store lifecycle
      handleLoad: actions.LOAD,
      handleRemoteChange: actions.REMOTE_CHANGE,

      // Mailbox auth
      handleAuthenticateGinboxMailbox: actions.AUTHENTICATE_GINBOX_MAILBOX,
      handleAuthenticateGmailMailbox: actions.AUTHENTICATE_GMAIL_MAILBOX,
      handleAuthenticateSlackMailbox: actions.AUTHENTICATE_SLACK_MAILBOX,
      handleAuthenticateTrelloMailbox: actions.AUTHENTICATE_TRELLO_MAILBOX,
      handleAuthenticateOutlookMailbox: actions.AUTHENTICATE_OUTLOOK_MAILBOX,
      handleAuthenticateOffice365Mailbox: actions.AUTHENTICATE_OFFICE365MAILBOX,
      handleAuthenticateGenericMailbox: actions.AUTHENTICATE_GENERIC_MAILBOX,

      handleReauthenticateMailbox: actions.REAUTHENTICATE_MAILBOX,
      handleReauthenticateGoogleMailbox: actions.REAUTHENTICATE_GOOGLE_MAILBOX,

      // Mailbox auth callbacks
      handleAuthGoogleMailboxSuccess: actions.AUTH_GOOGLE_MAILBOX_SUCCESS,
      handleAuthGoogleMailboxFailure: actions.AUTH_GOOGLE_MAILBOX_FAILURE,
      handleAuthSlackMailboxSuccess: actions.AUTH_SLACK_MAILBOX_SUCCESS,
      handleAuthSlackMailboxFailure: actions.AUTH_SLACK_MAILBOX_FAILURE,
      handleAuthTrelloMailboxSuccess: actions.AUTH_TRELLO_MAILBOX_SUCCESS,
      handleAuthTrelloMailboxFailure: actions.AUTH_TRELLO_MAILBOX_FAILURE,
      handleAuthMicrosoftMailboxSuccess: actions.AUTH_MICROSOFT_MAILBOX_SUCCESS,
      handleAuthMicrosoftMailboxFailure: actions.AUTH_MICROSOFT_MAILBOX_FAILURE,

      // Mailbox lifecycle
      handleConnectAllMailboxes: actions.CONNECT_ALL_MAILBOXES,
      handleConnectMailbox: actions.CONNECT_MAILBOX,
      handleDisconnectAllMailboxes: actions.DISCONNECT_ALL_MAILBOXES,
      handleDisconnectMailbox: actions.DISCONNECT_MAILBOX,

      // Mailboxes
      handleCreate: actions.CREATE,
      handleRemove: actions.REMOVE,
      handleMoveUp: actions.MOVE_UP,
      handleMoveDown: actions.MOVE_DOWN,
      handleReduce: actions.REDUCE,

      // Avatar
      handleSetCustomAvatar: actions.SET_CUSTOM_AVATAR,

      // Snapshots
      handleSetServiceSnapshot: actions.SET_SERVICE_SNAPSHOT,

      // Services
      handleReduceService: actions.REDUCE_SERVICE,

      // Active
      handleChangeActive: actions.CHANGE_ACTIVE,
      handleChangeActivePrev: actions.CHANGE_ACTIVE_TO_PREV,
      handleChangeActiveNext: actions.CHANGE_ACTIVE_TO_NEXT,

      // Search
      handleStartSearchingMailbox: actions.START_SEARCHING_MAILBOX,
      handleStopSearchingMailbox: actions.STOP_SEARCHING_MAILBOX,

      // Sync
      handleFullSyncMailbox: actions.FULL_SYNC_MAILBOX
    })
  }

  /* **************************************************************************/
  // Handlers: Store Lifecycle
  /* **************************************************************************/

  handleLoad () {
    // Load
    const allAvatars = avatarPersistence.allItemsSync()
    const allMailboxes = mailboxPersistence.allJSONItemsSync()
    this.index = []
    this.mailboxes = new Map()
    this.avatars = new Map()

    // Mailboxes
    Object.keys(allMailboxes).forEach((id) => {
      if (id === PERSISTENCE_INDEX_KEY) {
        this.index = allMailboxes[PERSISTENCE_INDEX_KEY]
      } else {
        const mailboxModel = MailboxFactory.modelize(id, allMailboxes[id])
        this.mailboxes.set(id, mailboxModel)
        ipcRenderer.sendSync('prepare-webview-session', { // Sync us across bridge so everything is setup before webview created
          partition: 'persist:' + mailboxModel.partition,
          mailboxType: mailboxModel.type
        })
      }
    })
    this.active = this.index[0] || null
    this.sendActiveStateToMainThread()

    // Avatars
    Object.keys(allAvatars).forEach((id) => {
      this.avatars.set(id, allAvatars[id])
    })
  }

  handleRemoteChange () {
    /* no-op */
  }

  /* **************************************************************************/
  // Providers: Utils
  /* **************************************************************************/

  /**
  * Saves a local mailbox ensuring changed time etc update accordingly and data sent up socket
  * @param id: the id of the provider
  * @param mailboxJS: the new js object for the mailbox or null to remove
  * @return the generated model
  */
  saveMailbox (id, mailboxJS) {
    // @future send mailbox to sever?
    if (mailboxJS === null) {
      mailboxPersistence.removeItem(id)
      this.mailboxes.delete(id)
      return undefined
    } else {
      mailboxJS.changedTime = new Date().getTime()
      mailboxJS.id = id
      const model = MailboxFactory.modelize(id, mailboxJS)
      mailboxPersistence.setJSONItem(id, mailboxJS)
      this.mailboxes.set(id, model)
      return model
    }
  }

  /**
  * Persist the provided index
  * @param index: the index to persist
  */
  saveIndex (index) {
    // @future send mailbox index to sever?
    this.index = index
    mailboxPersistence.setJSONItem(PERSISTENCE_INDEX_KEY, index)
  }

  /* **************************************************************************/
  // Mailbox Auth
  /* **************************************************************************/

  handleAuthenticateGinboxMailbox ({ provisionalId }) {
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-google', {
      credentials: credentials,
      id: provisionalId,
      provisional: GoogleMailbox.createJS(provisionalId, GoogleDefaultService.ACCESS_MODES.GINBOX)
    })
  }

  handleAuthenticateGmailMailbox ({ provisionalId }) {
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-google', {
      credentials: credentials,
      id: provisionalId,
      provisional: GoogleMailbox.createJS(provisionalId, GoogleDefaultService.ACCESS_MODES.GMAIL)
    })
  }

  handleAuthenticateSlackMailbox ({ provisionalId }) {
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-slack', {
      id: provisionalId,
      provisional: SlackMailbox.createJS(provisionalId)
    })
  }

  handleAuthenticateTrelloMailbox ({ provisionalId }) {
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-trello', {
      credentials: credentials,
      id: provisionalId,
      provisional: TrelloMailbox.createJS(provisionalId)
    })
  }

  handleAuthenticateOutlookMailbox ({ provisionalId }) {
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-microsoft', {
      credentials: credentials,
      id: provisionalId,
      provisional: MicrosoftMailbox.createJS(provisionalId, MicrosoftMailbox.ACCESS_MODES.OUTLOOK)
    })
  }

  handleAuthenticateOffice365Mailbox ({ provisionalId }) {
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-microsoft', {
      credentials: credentials,
      id: provisionalId,
      provisional: MicrosoftMailbox.createJS(provisionalId, MicrosoftMailbox.ACCESS_MODES.OFFICE365)
    })
  }

  handleAuthenticateGenericMailbox ({ provisionalId }) {
    actions.create.defer(provisionalId, GenericMailbox.createJS(provisionalId))
    window.location.hash = '/mailbox_wizard/generic/configure/' + provisionalId
  }

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  handleReauthenticateMailbox ({ mailboxId }) {
    const mailbox = this.mailboxes.get(mailboxId)
    if (mailbox) {
      switch (mailbox.type) {
        case CoreMailbox.MAILBOX_TYPES.GOOGLE:
          actions.reauthenticateGoogleMailbox.defer(mailboxId)
          break
        default:
          throw new Error('Mailbox does not support reauthentication')
      }
    }
    this.preventDefault()
  }

  handleReauthenticateGoogleMailbox ({ mailboxId }) {
    if (!this.mailboxes.get(mailboxId)) {
      this.preventDefault()
      return
    }

    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send('auth-google', {
      credentials: credentials,
      id: mailboxId,
      authMode: AUTH_MODES.REAUTHENTICATE,
      provisional: null
    })
  }

  /* **************************************************************************/
  // Mailbox Auth Callbacks
  /* **************************************************************************/

  handleAuthGoogleMailboxSuccess ({ provisionalId, provisional, temporaryCode, pushToken, authMode, codeRedirectUri }) {
    Promise.resolve()
      .then(() => GoogleHTTP.upgradeAuthCodeToPermenant(temporaryCode, codeRedirectUri))
      .then((auth) => {
        return GoogleHTTP.fetchAccountProfileWithRawAuth(auth)
          .then((response) => { // Build the complete auth object
            return Object.assign(auth, {
              pushToken: pushToken,
              email: (response.emails.find((a) => a.type === 'account') || {}).value
            })
          })
      })
      .then((auth) => {
        if (authMode === AUTH_MODES.REAUTHENTICATE) {
          actions.reduce.defer(provisionalId, (mailbox, auth) => {
            return mailbox.changeData({ auth: auth })
          }, auth)
          actions.fullSyncMailbox.defer(provisionalId)
          actions.connectMailbox.defer(provisionalId)
          window.location.hash = '/'
        } else {
          actions.create.defer(provisionalId, Object.assign(provisional, {
            auth: auth
          }))
          const accessMode = ((provisional.services || []).find((service) => service.type === GoogleDefaultService.type) || {}).accessMode
          if (accessMode === GoogleDefaultService.ACCESS_MODES.GMAIL) {
            window.location.hash = '/mailbox_wizard/google/configuregmail/' + provisionalId
          } else {
            window.location.hash = '/mailbox_wizard/google/configureinbox/' + provisionalId
          }
        }
      })
      .catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  handleAuthGoogleMailboxFailure ({ evt, data }) {
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      /* user cancelled. no-op */
    } else {
      console.error('[AUTH ERR]', data)
    }
  }

  handleAuthSlackMailboxSuccess ({ provisionalId, provisional, teamUrl, token, authMode }) {
    SlackHTTP.testAuth(token)
      .then((userInfo) => {
        actions.create.defer(provisionalId, Object.assign(provisional, {
          auth: {
            access_token: token,
            url: userInfo.url,
            team_name: userInfo.team,
            team_id: userInfo.team_id,
            user_name: userInfo.user,
            user_id: userInfo.user_id
          }
        }))
        window.location.hash = '/mailbox_wizard/complete'
      }).catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  handleAuthSlackMailboxFailure ({ evt, data }) {
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      /* user cancelled. no-op */
    } else {
      console.error('[AUTH ERR]', data)
    }
  }

  handleAuthTrelloMailboxSuccess ({ provisionalId, provisional, authToken, authAppKey, authMode }) {
    actions.create.defer(provisionalId, Object.assign(provisional, {
      authToken: authToken,
      authAppKey: authAppKey
    }))
    window.location.hash = '/mailbox_wizard/complete'
  }

  handleAuthTrelloMailboxFailure ({ evt, data }) {
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      /* user cancelled. no-op */
    } else {
      console.error('[AUTH ERR]', data)
    }
  }

  handleAuthMicrosoftMailboxSuccess ({ provisionalId, provisional, temporaryCode, authMode, codeRedirectUri }) {
    Promise.resolve()
      .then(() => MicrosoftHTTP.upgradeAuthCodeToPermenant(temporaryCode, codeRedirectUri))
      .then((auth) => {
        actions.create.defer(provisionalId, Object.assign(provisional, {
          auth: auth
        }))
        window.location.hash = '/mailbox_wizard/microsoft/services/' + provisionalId
      }).catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  handleAuthMicrosoftMailboxFailure ({ evt, data }) {
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().indexOf('user') !== -1) {
      /* user cancelled. no-op */
    } else {
      console.error('[AUTH ERR]', data)
    }
  }

  /* **************************************************************************/
  // Handlers: Mailbox lifecycle
  /* **************************************************************************/

  handleConnectAllMailboxes () {
    this.mailboxIds().forEach((mailboxId) => {
      actions.connectMailbox.defer(mailboxId)
    })
    this.preventDefault()
  }

  handleConnectMailbox ({ mailboxId }) {
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    if (mailbox.type === GoogleMailbox.type) {
      googleActions.connectMailbox.defer(mailboxId)
      this.preventDefault() // No change in this store
    } else if (mailbox.type === SlackMailbox.type) {
      slackActions.connectMailbox.defer(mailboxId)
      this.preventDefault() // No change in this store
    }
  }

  handleDisconnectAllMailboxes () {
    this.mailboxIds().forEach((mailboxId) => {
      actions.disconnectMailbox.defer(mailboxId)
    })
    this.preventDefault()
  }

  handleDisconnectMailbox ({ mailboxId }) {
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) {
      this.preventDefault()
      return
    }

    if (mailbox.type === GoogleMailbox.type) {
      googleActions.disconnectMailbox.defer(mailboxId)
      this.preventDefault() // No change in this store
    } else if (mailbox.type === SlackMailbox.type) {
      slackActions.disconnectMailbox.defer(mailboxId)
      this.preventDefault() // No change in this store
    }
  }

  /* **************************************************************************/
  // Handlers: Mailboxes
  /* **************************************************************************/

  handleCreate ({ id, data }) {
    const mailboxModel = this.saveMailbox(id, data)
    this.saveIndex(this.index.concat(id))
    ipcRenderer.sendSync('prepare-webview-session', { // Sync us across bridge so everything is setup before webview created
      partition: 'persist:' + mailboxModel.partition,
      mailboxType: mailboxModel.type
    })
    actions.changeActive.defer(id)
    actions.fullSyncMailbox.defer(id)
    actions.connectMailbox.defer(id)
  }

  handleRemove ({ id = this.activeMailboxId() }) {
    id = id || this.activeMailboxId()

    const wasActive = this.active === id
    this.saveMailbox(id, null)
    this.saveIndex(this.index.filter((i) => i !== id))
    if (wasActive) {
      actions.changeActive.defer(undefined)
    }
    actions.disconnectMailbox.defer(id)
  }

  handleMoveUp ({ id = this.activeMailboxId() }) {
    id = id || this.activeMailboxId()

    const index = Array.from(this.index)
    const mailboxIndex = index.findIndex((i) => i === id)
    if (mailboxIndex !== -1 && mailboxIndex !== 0) {
      index.splice(mailboxIndex - 1, 0, index.splice(mailboxIndex, 1)[0])
      this.saveIndex(index)
    } else {
      this.preventDefault()
    }
  }

  handleMoveDown ({ id = this.activeMailboxId() }) {
    id = id || this.activeMailboxId()

    const index = Array.from(this.index)
    const mailboxIndex = index.findIndex((i) => i === id)
    if (mailboxIndex !== -1 && mailboxIndex < index.length) {
      index.splice(mailboxIndex + 1, 0, index.splice(mailboxIndex, 1)[0])
      this.saveIndex(index)
    } else {
      this.preventDefault()
    }
  }

  handleReduce ({ id = this.activeMailboxId(), reducer, reducerArgs }) {
    const mailbox = this.mailboxes.get(id)
    if (mailbox) {
      const updatedJS = reducer.apply(this, [mailbox].concat(reducerArgs))
      if (updatedJS) {
        this.saveMailbox(id, updatedJS)
      } else {
        this.preventDefault()
      }
    } else {
      this.preventDefault()
    }
  }

  /* **************************************************************************/
  // Handlers: Avatar
  /* **************************************************************************/

  handleSetCustomAvatar ({id, b64Image}) {
    const mailbox = this.mailboxes.get(id)
    const data = mailbox.cloneData()
    if (b64Image) {
      const imageId = uuid.v4()
      data.customAvatar = imageId
      avatarPersistence.setItem(imageId, b64Image)
      this.avatars.set(imageId, b64Image)
    } else {
      if (data.customAvatar) {
        avatarPersistence.removeItem(data.customAvatar)
        this.avatars.delete(data.customAvatar)
        delete data.customAvatar
      }
    }
    this.saveMailbox(id, data)
  }

  /* **************************************************************************/
  // Handlers: Snapshots
  /* **************************************************************************/

  handleSetServiceSnapshot ({ id, service, snapshot }) {
    this.snapshots.set(`${id}:${service}`, snapshot)
  }

  /* **************************************************************************/
  // Handlers: Service
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

  /* **************************************************************************/
  // Handlers : Active
  /* **************************************************************************/

  /**
  * Handles the active mailbox changing
  * @param id: the id of the mailbox
  * @param service: the service type
  */
  handleChangeActive ({id, service}) {
    if (this.isMailboxRestricted(id, userStore.getState().user)) {
      window.location.hash = '/pro'
    } else {
      this.active = id || this.index[0]
      this.activeService = service
      this.sendActiveStateToMainThread()
    }
  }

  /**
  * Handles the active mailbox changing to the prev in the index
  */
  handleChangeActivePrev () {
    const activeIndex = this.index.findIndex((id) => id === this.active)
    const nextId = this.index[Math.max(0, activeIndex - 1)] || null
    if (this.isMailboxRestricted(nextId, userStore.getState().user)) {
      window.location.hash = '/pro'
    } else {
      this.active = nextId
      this.activeService = CoreMailbox.SERVICE_TYPES.DEFAULT
      this.sendActiveStateToMainThread()
    }
  }

  /**
  * Handles the active mailbox changing to the next in the index
  */
  handleChangeActiveNext () {
    const activeIndex = this.index.findIndex((id) => id === this.active)
    const nextId = this.index[Math.min(this.index.length - 1, activeIndex + 1)] || null
    if (this.isMailboxRestricted(nextId, userStore.getState().user)) {
      window.location.hash = '/pro'
    } else {
      this.active = nextId
      this.activeService = CoreMailbox.SERVICE_TYPES.DEFAULT
      this.sendActiveStateToMainThread()
    }
  }

  /**
  * Sends the current active state to the main thread
  */
  sendActiveStateToMainThread () {
    ipcRenderer.send('mailbox-storage-change-active', {
      mailboxId: this.activeMailboxId(),
      serviceType: this.activeMailboxService()
    })
  }

  /* **************************************************************************/
  // Handlers : Search
  /* **************************************************************************/

  /**
  * Indicates the mailbox is searching
  */
  handleStartSearchingMailbox ({ id, service }) {
    if (id && service) {
      this.search.set(`${id}:${service}`, true)
    } else {
      this.search.set(`${this.active}:${this.activeService}`, true)
    }
  }

  /**
  * Indicates the mailbox is no longer searching
  */
  handleStopSearchingMailbox ({id, service}) {
    if (id && service) {
      this.search.delete(`${id}:${service}`)
    } else {
      this.search.delete(`${this.active}:${this.activeService}`)
    }
  }

  /* **************************************************************************/
  // Handlers : Sync
  /* **************************************************************************/

  /**
  * Runs a full sync on a mailbox
  */
  handleFullSyncMailbox ({ id }) {
    const mailbox = this.getMailbox(id)
    if (!mailbox) { return }

    if (mailbox.type === GoogleMailbox.type) {
      googleActions.syncMailboxProfile.defer(id)
      googleActions.connectMailbox.defer(id)
      googleActions.registerMailboxWatch.defer(id)
      this.preventDefault() // No change in this store
    } else if (mailbox.type === TrelloMailbox.type) {
      trelloActions.syncMailboxProfile.defer(id)
      trelloActions.syncMailboxNotifications.defer(id)
      this.preventDefault() // No change in this store
    } else if (mailbox.type === SlackMailbox.type) {
      slackActions.connectMailbox.defer(id)
      slackActions.updateUnreadCounts.defer(id)
      this.preventDefault() // No change in this store
    } else if (mailbox.type === MicrosoftMailbox.type) {
      microsoftActions.syncMailboxProfile.defer(id)
      microsoftActions.syncMailboxMail.defer(id)
      this.preventDefault() // No change in this store
    }
  }
}

module.exports = alt.createStore(MailboxStore, 'MailboxStore')
