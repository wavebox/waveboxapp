import alt from '../alt'
import actions from './mailboxActions'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import MailboxFactory from 'shared/Models/Accounts/MailboxFactory'
import mailboxPersistence from './mailboxPersistence'
import avatarPersistence from './avatarPersistence'
import userStore from '../user/userStore'
import { PERSISTENCE_INDEX_KEY, SERVICE_LOCAL_AVATAR_PREFIX, MAILBOX_SLEEP_EXTEND } from 'shared/constants'
import { BLANK_PNG } from 'shared/b64Assets'
import uuid from 'uuid'
import googleActions from '../google/googleActions'
import GoogleHTTP from '../google/GoogleHTTP'
import slackActions from '../slack/slackActions'
import SlackHTTP from '../slack/SlackHTTP'
import trelloActions from '../trello/trelloActions'
import MicrosoftHTTP from '../microsoft/MicrosoftHTTP'
import microsoftActions from '../microsoft/microsoftActions'
import mailboxDispatch from './mailboxDispatch'
import Bootstrap from 'R/Bootstrap'
import { GoogleMailbox, GoogleDefaultService } from 'shared/Models/Accounts/Google'
import { SlackMailbox } from 'shared/Models/Accounts/Slack'
import { TrelloMailbox } from 'shared/Models/Accounts/Trello'
import { MicrosoftMailbox } from 'shared/Models/Accounts/Microsoft'
import { GenericMailbox } from 'shared/Models/Accounts/Generic'
import {
  WB_AUTH_GOOGLE,
  WB_AUTH_MICROSOFT,
  WB_AUTH_SLACK,
  WB_AUTH_TRELLO,
  WB_MAILBOX_STORAGE_CHANGE_ACTIVE,
  WB_PREPARE_MAILBOX_SESSION,
  WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT
} from 'shared/ipcEvents'

const { ipcRenderer } = window.nativeRequire('electron')
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
    this.sleepingQueue = new Map()
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
        if (mailbox.humanizedLogo) {
          return '../../' + mailbox.humanizedLogo
        } else if (mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo) {
          return '../../' + mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo
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
    // Sleeping
    /* ****************************************/

    /**
    * @param mailboxId: the id of the mailbox
    * @param serviceType: the type of service
    * @return true if the mailbox is sleeping
    */
    this.isSleeping = (mailboxId, serviceType) => {
      if (!userStore.getState().user.hasSleepable) { return false }

      // Check we support sleeping
      const mailbox = this.getMailbox(mailboxId)
      const service = mailbox ? mailbox.serviceForType(serviceType) : undefined
      if (!service || !service.sleepable) { return false }

      // Check if we are active
      if (this.isActive(mailboxId, serviceType)) { return false }

      // Check if we are queued for sleeping sleeping
      const key = `${mailboxId}:${serviceType}`
      if (this.sleepingQueue.has(key)) {
        return this.sleepingQueue.get(key).sleeping === true
      } else {
        return true
      }
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
      return this.search.has(`${mailboxId}:${service}`)
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return the search term for the mailbox
    */
    this.mailboxSearchTerm = (mailboxId, service) => {
      return (this.search.get(`${mailboxId}:${service}`) || {}).term || ''
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return the search has for the mailbox
    */
    this.mailboxSearchHash = (mailboxId, service) => {
      return (this.search.get(`${mailboxId}:${service}`) || {}).hash || ''
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
    this.hasUnreadActivityForAppBadge = () => {
      return !!this.allMailboxes().find((mailbox) => {
        return mailbox && mailbox.unreadActivityCountsTowardsAppUnread && mailbox.hasUnreadActivity
      })
    }

    /* ****************************************/
    // Takeout
    /* ****************************************/

    /**
    * Exports the data synchronously
    * @return the raw data
    */
    this.exportMailboxDataSync = () => {
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
    this.exportAvatarDataSync = () => {
      return avatarPersistence.allItemsSync()
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

      // Mailbox re-auth
      handleReauthenticateMailbox: actions.REAUTHENTICATE_MAILBOX,
      handleReauthenticateGoogleMailbox: actions.REAUTHENTICATE_GOOGLE_MAILBOX,
      handleReauthenticateMicrosoftMailbox: actions.REAUTHENTICATE_MICROSOFT_MAILBOX,
      handleReauthenticateSlackMailbox: actions.REAUTHENTICATE_SLACK_MAILBOX,
      handleReauthenticateTrelloMailbox: actions.REAUTHENTICATE_TRELLO_MAILBOX,

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
      handleSetServiceLocalAvatar: actions.SET_SERVICE_LOCAL_AVATAR,

      // Snapshots
      handleSetServiceSnapshot: actions.SET_SERVICE_SNAPSHOT,

      // Services
      handleReduceService: actions.REDUCE_SERVICE,

      // Active
      handleChangeActive: actions.CHANGE_ACTIVE,
      handleChangeActiveServiceIndex: actions.CHANGE_ACTIVE_SERVICE_INDEX,
      handleChangeActivePrev: actions.CHANGE_ACTIVE_TO_PREV,
      handleChangeActiveNext: actions.CHANGE_ACTIVE_TO_NEXT,

      // Sleeping
      handleAwakenService: actions.AWAKEN_SERVICE,
      handleSleepService: actions.SLEEP_SERVICE,

      // Search
      handleStartSearchingMailbox: actions.START_SEARCHING_MAILBOX,
      handleUntrackSearchingMailbox: actions.UNTRACK_SEARCHING_MAILBOX,
      handleStopSearchingMailbox: actions.STOP_SEARCHING_MAILBOX,
      handleSetSearchTerm: actions.SET_SEARCH_TERM,
      handleSearchNextTerm: actions.SEARCH_NEXT_TERM,

      // Sync
      handleFullSyncMailbox: actions.FULL_SYNC_MAILBOX,

      // Misc
      handlePingResourceUsage: actions.PING_RESOURCE_USAGE
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
        ipcRenderer.sendSync(WB_PREPARE_MAILBOX_SESSION, { // Sync us across bridge so everything is setup before webview created
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
    this.preventDefault()
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_GOOGLE, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: GoogleMailbox.createJS(provisionalId, GoogleDefaultService.ACCESS_MODES.GINBOX)
    })
  }

  handleAuthenticateGmailMailbox ({ provisionalId }) {
    this.preventDefault()
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_GOOGLE, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: GoogleMailbox.createJS(provisionalId, GoogleDefaultService.ACCESS_MODES.GMAIL)
    })
  }

  handleAuthenticateSlackMailbox ({ provisionalId }) {
    this.preventDefault()
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_SLACK, {
      id: provisionalId,
      provisional: SlackMailbox.createJS(provisionalId)
    })
  }

  handleAuthenticateTrelloMailbox ({ provisionalId }) {
    this.preventDefault()
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_TRELLO, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: TrelloMailbox.createJS(provisionalId)
    })
  }

  handleAuthenticateOutlookMailbox ({ provisionalId }) {
    this.preventDefault()
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_MICROSOFT, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: MicrosoftMailbox.createJS(provisionalId, MicrosoftMailbox.ACCESS_MODES.OUTLOOK)
    })
  }

  handleAuthenticateOffice365Mailbox ({ provisionalId }) {
    this.preventDefault()
    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_MICROSOFT, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: MicrosoftMailbox.createJS(provisionalId, MicrosoftMailbox.ACCESS_MODES.OFFICE365)
    })
  }

  handleAuthenticateGenericMailbox ({ provisionalId }) {
    this.preventDefault()
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
        case CoreMailbox.MAILBOX_TYPES.MICROSOFT:
          actions.reauthenticateMicrosoftMailbox.defer(mailboxId)
          break
        case CoreMailbox.MAILBOX_TYPES.TRELLO:
          actions.reauthenticateTrelloMailbox.defer(mailboxId)
          break
        case CoreMailbox.MAILBOX_TYPES.SLACK:
          actions.reauthenticateSlackMailbox.defer(mailboxId)
          break
        default:
          throw new Error('Mailbox does not support reauthentication')
      }
    }
    this.preventDefault()
  }

  handleReauthenticateGoogleMailbox ({ mailboxId }) {
    this.preventDefault()
    if (!this.mailboxes.get(mailboxId)) { return }

    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_GOOGLE, {
      credentials: Bootstrap.credentials,
      id: mailboxId,
      authMode: AUTH_MODES.REAUTHENTICATE,
      provisional: null
    })
  }

  handleReauthenticateMicrosoftMailbox ({ mailboxId }) {
    this.preventDefault()
    if (!this.mailboxes.get(mailboxId)) { return }

    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_MICROSOFT, {
      credentials: Bootstrap.credentials,
      id: mailboxId,
      authMode: AUTH_MODES.REAUTHENTICATE,
      provisional: null
    })
  }

  handleReauthenticateSlackMailbox ({ mailboxId }) {
    this.preventDefault()
    if (!this.mailboxes.get(mailboxId)) { return }

    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_SLACK, {
      id: mailboxId,
      provisional: null,
      authMode: AUTH_MODES.REAUTHENTICATE
    })
  }

  handleReauthenticateTrelloMailbox ({ mailboxId }) {
    this.preventDefault()
    if (!this.mailboxes.get(mailboxId)) { return }

    window.location.hash = '/mailbox_wizard/authenticating'
    ipcRenderer.send(WB_AUTH_TRELLO, {
      credentials: Bootstrap.credentials,
      id: mailboxId,
      provisional: null,
      authMode: AUTH_MODES.REAUTHENTICATE
    })
  }

  /**
  * Finalizes a re-authentication by ensuring the mailbox re-syncs and reloads
  * @param mailboxId: the id of the mailbox
  */
  _finalizeReauthentication (mailboxId) {
    actions.fullSyncMailbox.defer(mailboxId)
    actions.connectMailbox.defer(mailboxId)
    setTimeout(() => { mailboxDispatch.reload(mailboxId) }, 500)
    window.location.hash = '/'
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
          this._finalizeReauthentication(provisionalId)
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
        const auth = {
          access_token: token,
          url: userInfo.url,
          team_name: userInfo.team,
          team_id: userInfo.team_id,
          user_name: userInfo.user,
          user_id: userInfo.user_id
        }

        if (authMode === AUTH_MODES.REAUTHENTICATE) {
          actions.reduce.defer(provisionalId, (mailbox, auth) => {
            return mailbox.changeData({ auth: auth })
          }, auth)
          this._finalizeReauthentication(provisionalId)
        } else {
          actions.create.defer(provisionalId, Object.assign(provisional, {
            auth: auth
          }))
          window.location.hash = `/mailbox_wizard/complete/${provisionalId}`
        }
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
    if (authMode === AUTH_MODES.REAUTHENTICATE) {
      actions.reduce.defer(provisionalId, (mailbox, auth) => {
        return mailbox.changeData({
          authToken: auth.authToken,
          authAppKey: auth.authAppKey
        })
      }, { authToken: authToken, authAppKey: authAppKey })
      this._finalizeReauthentication(provisionalId)
    } else {
      actions.create.defer(provisionalId, Object.assign(provisional, {
        authToken: authToken,
        authAppKey: authAppKey
      }))
      window.location.hash = `/mailbox_wizard/complete/${provisionalId}`
    }
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
      .then(() => MicrosoftHTTP.upgradeAuthCodeToPermenant(temporaryCode, codeRedirectUri, 2))
      .then((auth) => {
        if (authMode === AUTH_MODES.REAUTHENTICATE) {
          actions.reduce.defer(provisionalId, (mailbox, auth) => {
            return mailbox.changeData({
              auth: {
                ...auth,
                protocolVersion: 2
              }
            })
          }, auth)
          this._finalizeReauthentication(provisionalId)
        } else {
          actions.create.defer(provisionalId, {
            ...provisional,
            auth: {
              ...auth,
              protocolVersion: 2
            }
          })
          window.location.hash = '/mailbox_wizard/microsoft/configure/' + provisionalId
        }
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
    ipcRenderer.sendSync(WB_PREPARE_MAILBOX_SESSION, { // Sync us across bridge so everything is setup before webview created
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
      if (data.customAvatar && this.avatars.get(data.customAvatar) === b64Image) {
        // Setting the same image. Nothing to do
        this.preventDefault()
        return
      } else {
        if (data.customAvatar) {
          avatarPersistence.removeItem(data.customAvatar)
          this.avatars.delete(data.customAvatar)
        }
        const imageId = uuid.v4()
        data.customAvatar = imageId
        avatarPersistence.setItem(imageId, b64Image)
        this.avatars.set(imageId, b64Image)
      }
    } else {
      if (data.customAvatar) {
        avatarPersistence.removeItem(data.customAvatar)
        this.avatars.delete(data.customAvatar)
        delete data.customAvatar
      }
    }
    this.saveMailbox(id, data)
  }

  handleSetServiceLocalAvatar ({ id, b64Image }) {
    const mailbox = this.mailboxes.get(id)
    const data = mailbox.cloneData()
    if (b64Image) {
      if (data.serviceLocalAvatar && this.avatars.get(data.serviceLocalAvatar) === b64Image) {
        // Setting the same image. Nothing to do
        this.preventDefault()
        return
      } else {
        if (data.serviceLocalAvatar) {
          avatarPersistence.removeItem(data.serviceLocalAvatar)
          this.avatars.delete(data.serviceLocalAvatar)
        }
        const imageId = SERVICE_LOCAL_AVATAR_PREFIX + uuid.v4()
        data.serviceLocalAvatar = imageId
        avatarPersistence.setItem(imageId, b64Image)
        this.avatars.set(imageId, b64Image)
      }
    } else {
      if (data.serviceLocalAvatar) {
        avatarPersistence.removeItem(data.serviceLocalAvatar)
        this.avatars.delete(data.serviceLocalAvatar)
        delete data.serviceLocalAvatarr
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
      this.preventDefault()
      window.location.hash = '/pro'
    } else {
      const nextMailbox = id || this.index[0]
      const nextService = service || CoreMailbox.SERVICE_TYPES.DEFAULT

      // Check we actually did change
      if (nextMailbox === this.active && nextService === this.activeService) {
        this.preventDefault()
        return
      }

      // Make the change
      this.scheduleSleep(this.active, this.activeService)
      this.clearSleep(nextMailbox, nextService)
      this.active = nextMailbox
      this.activeService = nextService
      this.sendActiveStateToMainThread()
    }
  }

  /**
  * Handles changing the active service to the one at the service
  * @param index: the index of the service
  */
  handleChangeActiveServiceIndex ({ index }) {
    if (this.isMailboxRestricted(this.active, userStore.getState().user)) {
      window.location.hash = '/pro'
    } else {
      const mailbox = this.getMailbox(this.active)
      if (mailbox.enabledServiceTypes[index]) {
        actions.changeActive.defer(mailbox.id, mailbox.enabledServiceTypes[index])
      }
    }
  }

  /**
  * Handles the active mailbox changing to the prev in the index
  * @param allowCycling: if true will cycle back when at end or beginning
  */
  handleChangeActivePrev ({ allowCycling }) {
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
  handleChangeActiveNext ({ allowCycling }) {
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
  * Sends the current active state to the main thread
  */
  sendActiveStateToMainThread () {
    ipcRenderer.send(WB_MAILBOX_STORAGE_CHANGE_ACTIVE, {
      mailboxId: this.activeMailboxId(),
      serviceType: this.activeMailboxService()
    })
  }

  /* **************************************************************************/
  // Handlers : Sleep
  /* **************************************************************************/

  handleAwakenService ({ id, service }) {
    this.clearSleep(id, service)
    const key = `${id}:${service}`
    this.sleepingQueue.set(key, { sleeping: false, timer: null })
  }

  handleSleepService ({ id, service }) {
    this._sendMailboxToSleep(id, service)
  }

  /**
  * Clears sleep for a mailbox and service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  clearSleep (mailboxId, serviceType) {
    const key = `${mailboxId}:${serviceType}`
    if (this.sleepingQueue.has(key)) {
      clearTimeout(this.sleepingQueue.get(key).timer)
      this.sleepingQueue.delete(key)
    }
  }

  /**
  * Schedules a new sleep for a mailbox/service
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  scheduleSleep (mailboxId, serviceType) {
    this.clearSleep(mailboxId, serviceType)

    const mailbox = this.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : undefined
    const wait = service ? service.sleepableTimeout : 0

    if (wait <= 0) {
      this._sendMailboxToSleep(mailboxId, serviceType)
    } else {
      const key = `${mailboxId}:${serviceType}`
      this.sleepingQueue.set(key, {
        sleeping: false,
        timer: setTimeout(() => {
          this._sendMailboxToSleep(mailboxId, serviceType)
        }, wait)
      })
    }
  }

  /**
  * Runs the process of sending a webview to sleep whilst also checking if it owns any other windows
  * @param mailboxId: the id of the mailbox
  * @param serviceType: the type of service
  */
  _sendMailboxToSleep (mailboxId, serviceType) {
    const key = `${mailboxId}:${serviceType}`
    const responseId = uuid.v4()
    const responder = (evt, { count }) => {
      if (this.isSleeping(mailboxId, serviceType)) { return }

      if (count === 0) {
        this.clearSleep(mailboxId, serviceType)
        this.sleepingQueue.set(key, { sleeping: true, timer: null })
        this.emitChange()
      } else {
        this.clearSleep(mailboxId, serviceType)
        this.sleepingQueue.set(key, {
          sleeping: false,
          timer: setTimeout(() => {
            this._sendMailboxToSleep(mailboxId, serviceType)
          }, MAILBOX_SLEEP_EXTEND)
        })
      }
    }

    ipcRenderer.once(responseId, responder)
    ipcRenderer.send(WB_MAILBOXES_WINDOW_FETCH_OPEN_WINDOW_COUNT, {
      mailboxId: mailboxId,
      serviceType: serviceType,
      response: responseId
    })
  }

  /* **************************************************************************/
  // Handlers : Search
  /* **************************************************************************/

  /**
  * Indicates the mailbox is searching
  */
  handleStartSearchingMailbox ({ id, service }) {
    const key = `${id || this.active}:${service || this.activeService}`
    this.search.set(key, { term: '', hash: `${Math.random()}` })
  }

  /**
  * Indicates the mailbox is no longer tracking search (i.e. handled by another provider)
  */
  handleUntrackSearchingMailbox ({ id, service }) {
    const key = `${id || this.active}:${service || this.activeService}`
    this.search.delete(key)
  }

  /**
  * Indicates the mailbox is no longer searching
  */
  handleStopSearchingMailbox ({id, service}) {
    const key = `${id || this.active}:${service || this.activeService}`
    this.search.delete(key)
  }

  /**
  * Sets the search term for a mailbox
  */
  handleSetSearchTerm ({ id, service, str }) {
    const key = `${id || this.active}:${service || this.activeService}`
    this.search.set(key, { term: str, hash: `${Math.random()}` })
  }

  /**
  * Indicates the user wants to search next
  */
  handleSearchNextTerm ({ id, service }) {
    const key = `${id || this.active}:${service || this.activeService}`
    if (this.search.has(key)) {
      this.search.set(key, Object.assign({}, this.search.get(key), { hash: `${Math.random()}` }))
    } else {
      this.search.set(key, { term: '', hash: `${Math.random()}` })
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
      googleActions.syncMailboxMessages.defer(id, true)
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

  /* **************************************************************************/
  // Handlers : Misc
  /* **************************************************************************/

  handlePingResourceUsage () {
    this.preventDefault()
    this.allMailboxes().forEach((mailbox) => {
      mailbox.enabledServices.forEach((service) => {
        const description = `Mailbox WebView: ${mailbox.displayName}:${service.humanizedType}`
        mailboxDispatch.pingResourceUsage(mailbox.id, service.type, description)
      })
    })
  }
}

export default alt.createStore(MailboxStore, 'MailboxStore')
