import RendererAccountStore from 'shared/AltStores/Account/RendererAccountStore'
import { STORE_NAME } from 'shared/AltStores/Account/AltAccountIdentifiers'
import alt from '../alt'
import actions from './accountActions'
import settingsActions from '../settings/settingsActions'
import GoogleHTTP from '../google/GoogleHTTP'
import SlackHTTP from '../slack/SlackHTTP'
import MicrosoftHTTP from '../microsoft/MicrosoftHTTP'
import accountDispatch from './accountDispatch'
import Bootstrap from 'R/Bootstrap'
import googleActions from '../google/googleActions'
import slackActions from '../slack/slackActions'
import trelloActions from '../trello/trelloActions'
import microsoftActions from '../microsoft/microsoftActions'
import userActions from '../user/userActions'
import {
  WB_AUTH_GOOGLE,
  WB_AUTH_MICROSOFT,
  WB_AUTH_SLACK,
  WB_AUTH_TRELLO,
  WB_NEW_WINDOW
} from 'shared/ipcEvents'
import { USER_PROFILE_DEFERED_SYNC_ON_CREATE } from 'shared/constants'
import { ipcRenderer } from 'electron'
import uuid from 'uuid'

const AUTH_MODES = {
  CREATE: 'CREATE',
  REAUTHENTICATE: 'REAUTHENTICATE'
}

class AccountStore extends RendererAccountStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this._snapshots_ = new Map()
    this._search_ = new Map()
    this._webcontentTabIds_ = new Map()

    /* ****************************************/
    // Snapshots
    /* ****************************************/

    this.getSnapshot = (serviceId) => { return this._snapshots_.get(serviceId) }

    /* ****************************************/
    // Search
    /* ****************************************/

    this.isSearchingService = (serviceId) => { return this._search_.has(serviceId) }

    this.serviceSearchTerm = (serviceId) => { return (this._search_.get(serviceId) || {}).term || '' }

    this.serviceSearchHash = (serviceId) => { return (this._search_.get(serviceId) || {}).hash || '' }

    /* ****************************************/
    // Tabs
    /* ****************************************/

    this.getWebcontentTabId = (serviceId) => { return this._webcontentTabIds_.get(serviceId) }

    this.getActiveWebcontentTabId = () => { return this.getWebcontentTabId(this.activeServiceId()) }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Tabs
      handleSetWebcontentTabId: actions.SET_WEBCONTENT_TAB_ID,
      handleDeleteWebcontentTabId: actions.DELETE_WEBCONTENT_TAB_ID,

      /*
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
*/
      // Snapshots
      handleSetServiceSnapshot: actions.SET_SERVICE_SNAPSHOT,

      // Search
      handleStartSearchingService: actions.START_SEARCHING_SERVICE,
      handleUntrackSearchingService: actions.UNTRACK_SEARCHING_SERVICE,
      handleStopSearchingService: actions.STOP_SEARCHING_SERVICE,
      handleSetServiceSearchTerm: actions.SET_SERVICE_SEARCH_TERM,
      handleSearchServiceNextTerm: actions.SEARCH_SERVICE_NEXT_TERM
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
    this.preventDefault()
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
    this.preventDefault()
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) { return }

    if (mailbox.type === GoogleMailbox.type) {
      googleActions.disconnectMailbox.defer(mailboxId)
    } else if (mailbox.type === SlackMailbox.type) {
      slackActions.disconnectMailbox.defer(mailboxId)
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  handleLoad (payload) {
    super.handleLoad(payload)

    /*this.mailboxIds().forEach((mailboxId) => {
      this.connectMailbox(mailboxId)
      actions.fullSyncMailbox.defer(mailboxId)
    })*/
  }

  /* **************************************************************************/
  // Mailbox
  /* **************************************************************************/

  /*handleRemoteSetMailbox (payload) {
    const { id, mailboxJS } = payload

    // Set the mailbox and also auto-connect or disconnect during set
    // Auto-disconnect
    const prev = this.mailboxes.get(id)
    if (prev && !mailboxJS) {
      this.disconnectMailbox(id)
      userActions.uploadUserProfile.defer()
    }
    super.handleRemoteSetMailbox(payload)
    const next = this.mailboxes.get(id)

    // Auto-connect
    if (!prev && next) {
      this.connectMailbox(id)
      actions.fullSyncMailbox.defer(id)
      userActions.uploadUserProfile.defer()
      // Sync the profile again after a certain amount of time. The user is likely
      // to have customized it again within this time
      userActions.uploadUserProfileAfter.defer(USER_PROFILE_DEFERED_SYNC_ON_CREATE)
    }

    // Look for any watch fields to see if we should re-sync
    if (prev && next) {
      if (next.type === CoreMailbox.MAILBOX_TYPES.GOOGLE) {
        const watch = [
          'unreadMode',
          'customUnreadQuery',
          'customUnreadLabelWatchString',
          'customUnreadCountFromLabel',
          'customUnreadCountLabel',
          'customUnreadCountLabelField'
        ]
        const prevService = prev.defaultService
        const nextService = next.defaultService
        const changed = !!watch.find((n) => prevService[n] !== nextService[n])

        if (changed) {
          googleActions.syncMailboxMessages.defer(id, true)
        }
      } else if (next.type === CoreMailbox.MAILBOX_TYPES.MICROSOFT) {
        const watch = [
          'unreadMode'
        ]
        const prevService = prev.defaultService
        const nextService = next.defaultService
        const changed = !!watch.find((n) => prevService[n] !== nextService[n])

        if (changed) {
          microsoftActions.syncMailboxMail.defer(id)
        }
      }
    }
  }*/

  /* **************************************************************************/
  // Tabs
  /* **************************************************************************/

  handleSetWebcontentTabId ({ serviceId, tabId }) {
    this.webcontentTabIds.set(serviceId, tabId)
  }

  handleDeleteWebcontentTabId ({ serviceId }) {
    this.webcontentTabIds.delete(serviceId)
  }

  /* **************************************************************************/
  // Mailbox Auth
  /* **************************************************************************/

  /*handleAuthenticateGinboxMailbox ({ provisionalId, provisionalJS }) {
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
  }*/

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  /*handleReauthenticateMailbox ({ mailboxId }) {
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
  }*/

  /**
  * Finalizes a re-authentication by ensuring the mailbox re-syncs and reloads
  * @param mailboxId: the id of the mailbox
  */
  /*_finalizeReauthentication (mailboxId) {
    setTimeout(() => { mailboxDispatch.reload(mailboxId) }, 500)
    window.location.hash = '/'
  }*/

  /**
  * Finalizes a new account
  * @param nextUrl='/': the next url to visit
  */
  /*_finalizeCreateAccount (nextUrl = '/') {
    window.location.hash = nextUrl
    settingsActions.tourStart.defer()
  }*/

  /* **************************************************************************/
  // Mailbox Auth Callbacks
  /* **************************************************************************/

  /*handleAuthGoogleMailboxSuccess ({ provisionalId, provisional, temporaryCode, pushToken, authMode, codeRedirectUri }) {
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
      // user cancelled. no-op
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
      // user cancelled. no-op
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
      // user cancelled. no-op
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
      // user cancelled. no-op
    } else {
      console.error('[AUTH ERR]', data)
    }
  }*/

  /* **************************************************************************/
  // Connection & Sync
  /* **************************************************************************/

  /*handleFullSyncMailbox ({ id }) {
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
  }*/

  /* **************************************************************************/
  // Snapshots
  /* **************************************************************************/

  handleSetServiceSnapshot ({ serviceId, snapshot }) {
    this.snapshots.set(serviceId, snapshot)
  }

  /* **************************************************************************/
  // Handlers : Search
  /* **************************************************************************/

  handleStartSearchingService ({ serviceId = this.activeServiceId() }) {
    if (!serviceId) { this.preventDefault(); return }
    this._search_.set(serviceId, {
      term: '',
      hash: uuid.v4()
    })
  }

  handleUntrackSearchingService ({ serviceId = this.activeServiceId() }) {
    this._search_.delete(serviceId)
  }

  handleStopSearchingService ({ serviceId = this.activeServiceId() }) {
    this._search_.delete(serviceId)
  }

  handleSetServiceSearchTerm ({ serviceId = this.activeServiceId(), str }) {
    if (!serviceId) { this.preventDefault(); return }
    this._search_.set(serviceId, {
      term: str,
      hash: uuid.v4()
    })
  }

  handleSearchServiceNextTerm ({ serviceId = this.activeServiceId() }) {
    if (!serviceId) { this.preventDefault(); return }
    this._search_.set(serviceId, {
      term: '',
      ...this._search_.get(serviceId),
      hash: uuid.v4()
    })
  }
}

export default alt.createStore(AccountStore, STORE_NAME)
