import RendererMailboxStore from 'shared/AltStores/Mailbox/RendererMailboxStore'
import { STORE_NAME } from 'shared/AltStores/Mailbox/AltMailboxIdentifiers'
import alt from '../alt'
import actions from './mailboxActions'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import settingsActions from '../settings/settingsActions'
import GoogleHTTP from '../google/GoogleHTTP'
import SlackHTTP from '../slack/SlackHTTP'
import MicrosoftHTTP from '../microsoft/MicrosoftHTTP'
import mailboxDispatch from './mailboxDispatch'
import Bootstrap from 'R/Bootstrap'
import googleActions from '../google/googleActions'
import slackActions from '../slack/slackActions'
import trelloActions from '../trello/trelloActions'
import microsoftActions from '../microsoft/microsoftActions'
import { GoogleMailbox, GoogleDefaultService } from 'shared/Models/Accounts/Google'
import { SlackMailbox } from 'shared/Models/Accounts/Slack'
import { TrelloMailbox } from 'shared/Models/Accounts/Trello'
import { MicrosoftMailbox } from 'shared/Models/Accounts/Microsoft'
import { GenericMailbox } from 'shared/Models/Accounts/Generic'
import { ContainerMailbox } from 'shared/Models/Accounts/Container'
import {
  GoogleMailboxReducer,
  SlackMailboxReducer,
  TrelloMailboxReducer,
  MicrosoftMailboxReducer
} from 'shared/AltStores/Mailbox/MailboxReducers'
import {
  WB_AUTH_GOOGLE,
  WB_AUTH_MICROSOFT,
  WB_AUTH_SLACK,
  WB_AUTH_TRELLO,
  WB_NEW_WINDOW
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import uuid from 'uuid'

const AUTH_MODES = {
  CREATE: 'CREATE',
  REAUTHENTICATE: 'REAUTHENTICATE'
}

class MailboxStore extends RendererMailboxStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this.snapshots = new Map()
    this.search = new Map()

    /* ****************************************/
    // Search
    /* ****************************************/

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return true if the mailbox is searching, false otherwise
    */
    this.isSearchingMailbox = (mailboxId, service) => {
      return this.search.has(this.getFullServiceKey(mailboxId, service))
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return the search term for the mailbox
    */
    this.mailboxSearchTerm = (mailboxId, service) => {
      return (this.search.get(this.getFullServiceKey(mailboxId, service)) || {}).term || ''
    }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return the search has for the mailbox
    */
    this.mailboxSearchHash = (mailboxId, service) => {
      return (this.search.get(this.getFullServiceKey(mailboxId, service)) || {}).hash || ''
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Mailbox auth
      handleAuthenticateGinboxMailbox: actions.AUTHENTICATE_GINBOX_MAILBOX,
      handleAuthenticateGmailMailbox: actions.AUTHENTICATE_GMAIL_MAILBOX,
      handleAuthenticateSlackMailbox: actions.AUTHENTICATE_SLACK_MAILBOX,
      handleAuthenticateTrelloMailbox: actions.AUTHENTICATE_TRELLO_MAILBOX,
      handleAuthenticateOutlookMailbox: actions.AUTHENTICATE_OUTLOOK_MAILBOX,
      handleAuthenticateOffice365Mailbox: actions.AUTHENTICATE_OFFICE365MAILBOX,
      handleAuthenticateGenericMailbox: actions.AUTHENTICATE_GENERIC_MAILBOX,
      handleAuthenticateContainerMailbox: actions.AUTHENTICATE_CONTAINER_MAILBOX,

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

      // Connection & Sync
      handleFullSyncMailbox: actions.FULL_SYNC_MAILBOX,

      // Snapshots
      handleSetServiceSnapshot: actions.SET_SERVICE_SNAPSHOT,

      // Search
      handleStartSearchingMailbox: actions.START_SEARCHING_MAILBOX,
      handleUntrackSearchingMailbox: actions.UNTRACK_SEARCHING_MAILBOX,
      handleStopSearchingMailbox: actions.STOP_SEARCHING_MAILBOX,
      handleSetSearchTerm: actions.SET_SEARCH_TERM,
      handleSearchNextTerm: actions.SEARCH_NEXT_TERM
    })
  }

  /* **************************************************************************/
  // Utils: Mailbox connection
  /* **************************************************************************/

  /**
  * Connect a mailbox
  * @param mailboxId: the id of the mailbox
  */
  connectMailbox (mailboxId) {
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) { return }

    if (mailbox.type === GoogleMailbox.type) {
      googleActions.connectMailbox.defer(mailboxId)
    } else if (mailbox.type === SlackMailbox.type) {
      slackActions.connectMailbox.defer(mailboxId)
    }
  }

  /**
  * Disconnects a mailbox
  * @param mailboxId: the id of the mailbox
  */
  disconnectMailbox ({ mailboxId }) {
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) { return }

    if (mailbox.type === GoogleMailbox.type) {
      googleActions.disconnectMailbox.defer(mailboxId)
    } else if (mailbox.type === SlackMailbox.type) {
      slackActions.disconnectMailbox.defer(mailboxId)
    }
  }

  /* **************************************************************************/
  // Mailbox
  /* **************************************************************************/

  handleRemoteSetMailbox (payload) {
    const { id, mailboxJS } = payload

    // Figure out if we should connect / disconnect mailbox
    let autoconnect = false
    let autodisconnect = false
    if (mailboxJS) {
      if (!this.mailboxes.has(id)) {
        autoconnect = true
      }
    } else {
      if (this.mailboxes.has(id)) {
        autodisconnect = true
      }
    }

    // Disconnect before removing
    if (autodisconnect) { this.disconnectMailbox(id) }

    // Run action
    super.handleRemoteSetMailbox(payload)

    // Connect after adding
    if (autoconnect) {
      this.connectMailbox(id)
      actions.fullSyncMailbox(id)
    }
  }

  /* **************************************************************************/
  // Mailbox Auth
  /* **************************************************************************/

  handleAuthenticateGinboxMailbox ({ provisionalId, provisionalJS }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${GoogleMailbox.type}/${GoogleDefaultService.ACCESS_MODES.GINBOX}/1/${provisionalId}`
    ipcRenderer.send(WB_AUTH_GOOGLE, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: GoogleMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments())
    })
  }

  handleAuthenticateGmailMailbox ({ provisionalId, provisionalJS }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${GoogleMailbox.type}/${GoogleDefaultService.ACCESS_MODES.GMAIL}/1/${provisionalId}`
    ipcRenderer.send(WB_AUTH_GOOGLE, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: GoogleMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments())
    })
  }

  handleAuthenticateSlackMailbox ({ provisionalId, provisionalJS }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${SlackMailbox.type}/_/1/${provisionalId}`
    ipcRenderer.send(WB_AUTH_SLACK, {
      id: provisionalId,
      provisional: SlackMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments())
    })
  }

  handleAuthenticateTrelloMailbox ({ provisionalId, provisionalJS }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${TrelloMailbox.type}/_/1/${provisionalId}`
    ipcRenderer.send(WB_AUTH_TRELLO, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: TrelloMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments())
    })
  }

  handleAuthenticateOutlookMailbox ({ provisionalId, provisionalJS, additionalPermissions }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${MicrosoftMailbox.type}/${MicrosoftMailbox.ACCESS_MODES.OUTLOOK}/1/${provisionalId}`
    ipcRenderer.send(WB_AUTH_MICROSOFT, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: MicrosoftMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments()),
      additionalPermissions: additionalPermissions
    })
  }

  handleAuthenticateOffice365Mailbox ({ provisionalId, provisionalJS, additionalPermissions }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${MicrosoftMailbox.type}/${MicrosoftMailbox.ACCESS_MODES.OFFICE365}/1/${provisionalId}`
    ipcRenderer.send(WB_AUTH_MICROSOFT, {
      credentials: Bootstrap.credentials,
      id: provisionalId,
      provisional: MicrosoftMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments()),
      additionalPermissions: additionalPermissions
    })
  }

  handleAuthenticateGenericMailbox ({ provisionalId, provisionalJS, writePermission }) {
    this.preventDefault()
    actions.create.defer(
      provisionalId,
      GenericMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments())
    )
    this._finalizeCreateAccount(`/mailbox_wizard/${GenericMailbox.type}/_/2/${provisionalId}`)
  }

  handleAuthenticateContainerMailbox ({ containerId, provisionalId, provisionalJS, writePermission }) {
    this.preventDefault()

    const container = this.getContainer(containerId)
    if (!container) {
      console.error('[AUTH ERR]', `Unable to authenticate mailbox with id "${provisionalId}" as containerId "${containerId}" is unknown`)
      return
    }

    provisionalJS.container = container.cloneForMailbox()
    actions.create.defer(
      provisionalId,
      ContainerMailbox.applyExperimentsToProvisionalJS(provisionalJS, this.getWireConfigExperiments())
    )
    this._finalizeCreateAccount(`/mailbox_wizard/${ContainerMailbox.type}/${containerId}/2/${provisionalId}`)

    // Open post-install
    if (container.hasPostInstallUrl) {
      setTimeout(() => {
        ipcRenderer.send(WB_NEW_WINDOW, {
          mailboxId: provisionalId,
          serviceType: CoreMailbox.SERVICE_TYPES.DEFAULT,
          url: container.postInstallUrl,
          partition: `persist:${provisionalJS}`,
          windowPreferences: {
            webPreferences: undefined
          },
          webPreferences: {
            partition: `persist:${provisionalId}`
          }
        })
      }, container.postInstallUrlDelay)
    }
  }

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  handleReauthenticateMailbox ({ mailboxId }) {
    this.preventDefault()
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
  }

  handleReauthenticateGoogleMailbox ({ mailboxId }) {
    this.preventDefault()
    if (!this.mailboxes.get(mailboxId)) { return }

    window.location.hash = '/mailbox/reauthenticating'
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

    window.location.hash = '/mailbox/reauthenticating'
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

    window.location.hash = '/mailbox/reauthenticating'
    ipcRenderer.send(WB_AUTH_SLACK, {
      id: mailboxId,
      provisional: null,
      authMode: AUTH_MODES.REAUTHENTICATE
    })
  }

  handleReauthenticateTrelloMailbox ({ mailboxId }) {
    this.preventDefault()
    if (!this.mailboxes.get(mailboxId)) { return }

    window.location.hash = '/mailbox/reauthenticating'
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
    setTimeout(() => { mailboxDispatch.reload(mailboxId) }, 500)
    window.location.hash = '/'
  }

  /**
  * Finalizes a new account
  * @param nextUrl='/': the next url to visit
  */
  _finalizeCreateAccount (nextUrl = '/') {
    window.location.hash = nextUrl
    settingsActions.tourStart.defer()
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
          actions.reduce.defer(provisionalId, GoogleMailboxReducer.setAuth, auth)
          this._finalizeReauthentication(provisionalId)
        } else {
          actions.create.defer(provisionalId, Object.assign(provisional, {
            auth: auth
          }))
          const accessMode = ((provisional.services || []).find((service) => service.type === GoogleDefaultService.type) || {}).accessMode
          this._finalizeCreateAccount(`/mailbox_wizard/${GoogleMailbox.type}/${accessMode}/2/${provisionalId}`)
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
          actions.reduce.defer(provisionalId, SlackMailboxReducer.setAuth, auth)
          this._finalizeReauthentication(provisionalId)
        } else {
          actions.create.defer(provisionalId, Object.assign(provisional, {
            auth: auth
          }))
          this._finalizeCreateAccount()
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
      actions.reduce.defer(provisionalId, TrelloMailboxReducer.setAuth, authToken, authAppKey)
      this._finalizeReauthentication(provisionalId)
    } else {
      actions.create.defer(provisionalId, Object.assign(provisional, {
        authToken: authToken,
        authAppKey: authAppKey
      }))
      this._finalizeCreateAccount()
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
          actions.reduce.defer(provisionalId, MicrosoftMailboxReducer.setAuthInfo, {
            ...auth,
            protocolVersion: 2
          })
          this._finalizeReauthentication(provisionalId)
        } else {
          actions.create.defer(provisionalId, {
            ...provisional,
            auth: {
              ...auth,
              protocolVersion: 2
            }
          })
          this._finalizeCreateAccount(`/mailbox_wizard/${MicrosoftMailbox.type}/${provisional.accessMode}/2/${provisionalId}`)
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
  // Connection & Sync
  /* **************************************************************************/

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
  // Snapshots
  /* **************************************************************************/

  handleSetServiceSnapshot ({ id, service, snapshot }) {
    this.snapshots.set(this.getFullServiceKey(id, service, snapshot))
  }

  /* **************************************************************************/
  // Handlers : Search
  /* **************************************************************************/

  handleStartSearchingMailbox ({ id = this.active, service = this.activeService }) {
    this.search.set(this.getFullServiceKey(id, service), {
      term: '',
      hash: uuid.v4()
    })
  }

  handleUntrackSearchingMailbox ({ id = this.active, service = this.activeService }) {
    this.search.delete(this.getFullServiceKey(id, service))
  }

  handleStopSearchingMailbox ({ id = this.active, service = this.activeService }) {
    this.search.delete(this.getFullServiceKey(id, service))
  }

  handleSetSearchTerm ({ id = this.active, service = this.activeService, str }) {
    this.search.set(this.getFullServiceKey(id, service), {
      term: str,
      hash: uuid.v4()
    })
  }

  handleSearchNextTerm ({ id = this.active, service = this.activeService }) {
    const key = this.getFullServiceKey(id, service)
    if (this.search.has(key)) {
      this.search.set(key, {
        ...this.search.get(key),
        hash: uuid.v4()
      })
    } else {
      this.search.set(key, {
        term: '',
        hash: uuid.v4()
      })
    }
  }
}

export default alt.createStore(MailboxStore, STORE_NAME)
