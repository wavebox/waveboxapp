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
import { ACCOUNT_TEMPLATE_TYPES } from 'shared/Models/ACAccounts/AccountTemplates'
import ACTemplatedAccount from 'shared/Models/ACAccounts/ACTemplatedAccount'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import CoreACService from 'shared/Models/ACAccounts/CoreACService'
import GoogleAuth from 'shared/Models/ACAccounts/Google/GoogleAuth'
import SlackAuth from 'shared/Models/ACAccounts/Slack/SlackAuth'
import TrelloAuth from 'shared/Models/ACAccounts/Trello/TrelloAuth'
import MicrosoftAuth from 'shared/Models/ACAccounts/Microsoft/MicrosoftAuth'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import AuthReducer from 'shared/AltStores/Account/AuthReducers/AuthReducer'
import CoreACAuth from 'shared/Models/ACAccounts/CoreACAuth'

const AUTH_MODES = Object.freeze({
  TEMPLATE_CREATE: 'TEMPLATE_CREATE',
  REAUTHENTICATE: 'REAUTHENTICATE'
})

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

    /**
    * @param serviceId: the id of the service to get snapshot for
    * @return the snapshot data or undefined
    */
    this.getSnapshot = (serviceId) => {
      return this._snapshots_.get(serviceId)
    }

    /* ****************************************/
    // Search
    /* ****************************************/

    /**
    * @param serviceId: the id of the service
    * @return true if we're searching the service, false otherwise
    */
    this.isSearchingService = (serviceId) => {
      return this._search_.has(serviceId)
    }

    /**
    * @param serviceId: the id of the service
    * @return the search term we're searching for or an empty string
    */
    this.serviceSearchTerm = (serviceId) => {
      return (this._search_.get(serviceId) || {}).term || ''
    }

    /**
    * @param serviceId: the id of the service
    * @return a search hash we're looking for or an empty string
    */
    this.serviceSearchHash = (serviceId) => {
      return (this._search_.get(serviceId) || {}).hash || ''
    }

    /* ****************************************/
    // Tabs
    /* ****************************************/

    /**
    * @param serviceId: the id of the service
    * @return the id of the webcontents for the given service
    */
    this.getWebcontentTabId = (serviceId) => {
      return this._webcontentTabIds_.get(serviceId)
    }

    /**
    * @return the webcontents id for the active service
    */
    this.getActiveWebcontentTabId = () => {
      return this.getWebcontentTabId(this.activeServiceId())
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Tabs
      handleSetWebcontentTabId: actions.SET_WEBCONTENT_TAB_ID,
      handleDeleteWebcontentTabId: actions.DELETE_WEBCONTENT_TAB_ID,

      // Mailbox creation
      handleAuthMailboxGroupFromTemplate: actions.AUTH_MAILBOX_GROUP_FROM_TEMPLATE,

      // Mailbox auth callbacks
      handleAuthFailure: actions.AUTH_FAILURE,
      handleAuthGoogleSuccess: actions.AUTH_GOOGLE_SUCCESS,
      handleAuthSlackSuccess: actions.AUTH_SLACK_SUCCESS,
      handleAuthTrelloSuccess: actions.AUTH_TRELLO_SUCCESS,
      handleAuthMicrosoftSuccess: actions.AUTH_MICROSOFT_SUCCESS,

      // Re-auth
      handleReauthenticateService: actions.REAUTHENTICATE_SERVICE,

      // Connection & Sync
      handleFullSyncService: actions.FULL_SYNC_SERVICE,

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
  // Utils: Service connection
  /* **************************************************************************/

  /**
  * Connect a service
  * @param service: the service to connect
  */
  connectService (service) {
    switch (service.type) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
        googleActions.connectService.defer(service.id)
        break
      case SERVICE_TYPES.SLACK:
        slackActions.connectService.defer(service.id)
        break
    }
  }

  /**
  * Disconnect a service
  * @param service: the service to disconnect
  */
  disconnectService (service) {
    switch (service.type) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
        googleActions.disconnectService.defer(service.id)
        break
      case SERVICE_TYPES.SLACK:
        slackActions.disconnectService.defer(service.id)
        break
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  handleLoad (payload) {
    super.handleLoad(payload)

    this.serviceIds().forEach((serviceId) => {
      this.connectService(serviceId)
      actions.fullSyncService.defer(serviceId)
    })
  }

  /* **************************************************************************/
  // Service
  /* **************************************************************************/

  handleRemoteSetService (payload) {
    const { id, serviceJS } = payload

    // Auto-disconnect the service
    const prev = this.getService(id)
    if (prev && !serviceJS) {
      this.disconnectService(prev)
      userActions.uploadUserProfile.defer()
    }

    super.handleRemoteSetService(payload)

    // Auto-connect the service
    const next = this.getService(id)
    if (!prev && next) {
      this.connectService(next)
      actions.fullSyncService.defer(id)
      userActions.uploadUserProfile.defer()

      // Sync the profile again after a certain amount of time. The user is likely
      // to have customized it again within this time
      userActions.uploadUserProfileAfter.defer(USER_PROFILE_DEFERED_SYNC_ON_CREATE)
    }

    // Look to see if a watch field changed
    if (prev && next && next.syncWatchFields.length) {
      const changed = next.syncWatchFields.filter((k) => prev[k] !== next[k])
      if (changed.length) {
        switch (next.type) {
          case SERVICE_TYPES.GOOGLE_MAIL:
          case SERVICE_TYPES.GOOGLE_INBOX:
            googleActions.serviceSyncWatchFieldChange(next.id, changed)
            break
          case SERVICE_TYPES.MICROSOFT:
            microsoftActions.serviceSyncWatchFieldChange(next.id, changed)
            break
        }
      }
    }
  }

  /* **************************************************************************/
  // Tabs
  /* **************************************************************************/

  handleSetWebcontentTabId ({ serviceId, tabId }) {
    this._webcontentTabIds_.set(serviceId, tabId)
  }

  handleDeleteWebcontentTabId ({ serviceId }) {
    this._webcontentTabIds_.delete(serviceId)
  }

  /* **************************************************************************/
  // Mailbox Creation
  /* **************************************************************************/

  handleAuthMailboxGroupFromTemplate ({ template }) {
    this.preventDefault()

    const mailboxId = uuid.v4()

    if (template.templateType === ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL || template.templateType === ACCOUNT_TEMPLATE_TYPES.GOOGLE_INBOX) {
      window.location.hash = `/mailbox_wizard/${template.templateType}/_/1/${mailboxId}`
      ipcRenderer.send(WB_AUTH_GOOGLE, {
        partitionId: `persist:${mailboxId}`,
        credentials: Bootstrap.credentials,
        mode: AUTH_MODES.TEMPLATE_CREATE,
        context: {
          id: mailboxId,
          template: template.cloneData()
        }
      })
    } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.OUTLOOK || template.templateType === ACCOUNT_TEMPLATE_TYPES.OFFICE365) {
      window.location.hash = `/mailbox_wizard/${template.templateType}/${template.accessMode}/1/${mailboxId}`
      ipcRenderer.send(WB_AUTH_MICROSOFT, {
        partitionId: `persist:${mailboxId}`,
        credentials: Bootstrap.credentials,
        mode: AUTH_MODES.TEMPLATE_CREATE,
        context: {
          id: mailboxId,
          template: template.cloneData()
        }
      })
    } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.TRELLO) {
      window.location.hash = `/mailbox_wizard/${template.templateType}/_/1/${mailboxId}`
      ipcRenderer.send(WB_AUTH_TRELLO, {
        partitionId: `persist:${mailboxId}`,
        credentials: Bootstrap.credentials,
        mode: AUTH_MODES.TEMPLATE_CREATE,
        context: {
          id: mailboxId,
          template: template.cloneData()
        }
      })
    } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.SLACK) {
      window.location.hash = `/mailbox_wizard/${template.templateType}/_/1/${mailboxId}`
      ipcRenderer.send(WB_AUTH_SLACK, {
        partitionId: `persist:${mailboxId}`,
        mode: AUTH_MODES.TEMPLATE_CREATE,
        context: {
          id: mailboxId,
          template: template.cloneData()
        }
      })
    } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.CONTAINER) {
      this._createMailboxFromTemplate(mailboxId, template)
      this._finalizeCreateAccount(`/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${mailboxId}`, 0)
    } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.GENERIC) {
      this._createMailboxFromTemplate(mailboxId, template)
      this._finalizeCreateAccount(`/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${mailboxId}`, 0)
    }
  }

  /* **************************************************************************/
  // Mailbox Creation: Utils
  /* **************************************************************************/

  /**
  * Creates a mailbox and service from a template issuing deferred actions
  * @param mailboxId: the id of the mailbox
  * @param template: the template to use to generate the members
  */
  _createMailboxFromTemplate (mailboxId, template) {
    if (template.templateType === ACCOUNT_TEMPLATE_TYPES.CONTAINER) {
      const containerId = template.accessMode
      const container = this.getContainer(containerId)
      if (!container) {
        console.error('[AUTH ERR]', `Unable to authenticate mailbox with id "${mailboxId}" as containerId "${containerId}" is unknown`)
        setTimeout(() => { window.location.hash = '/' })
        return
      }

      actions.createMailbox.defer(ACMailbox.createJS(
        mailboxId,
        template.displayName,
        template.color,
        template.templateType
      ))
      let serviceId
      template.services.forEach((serviceType) => {
        const service = {
          ...CoreACService.createJS(undefined, mailboxId, serviceType),
          container: container.cloneForService(),
          containerId: containerId
        }
        serviceId = service.id
        actions.createService.defer(mailboxId, template.servicesUILocation, service)
      })

      // Open post-install
      if (container.hasPostInstallUrl) {
        setTimeout(() => {
          ipcRenderer.send(WB_NEW_WINDOW, {
            mailboxId: mailboxId,
            serviceId: serviceId,
            url: container.postInstallUrl,
            partition: `persist:${mailboxId}`,
            windowPreferences: { webPreferences: undefined },
            webPreferences: { partition: `persist:${mailboxId}` }
          })
        }, container.postInstallUrlDelay)
      }
    } else {
      actions.createMailbox.defer(ACMailbox.createJS(
        mailboxId,
        template.displayName,
        template.color,
        template.templateType
      ))
      template.services.forEach((serviceType) => {
        const service = CoreACService.createJS(
          undefined,
          mailboxId,
          serviceType
        )
        actions.createService.defer(mailboxId, template.servicesUILocation, service)
      })
    }
  }

  /**
  * @param nextUrl='/': the next url to visit
  * @param wait=250: millis to wait before redirecting
  */
  _finalizeCreateAccount (nextUrl = '/', wait = 250) {
    // The final step of account creation takes a couple of seconds to cross the bridge
    // a few times. To not display janky info to the user wait a little before redirecting
    // them
    setTimeout(() => {
      window.location.hash = nextUrl
      settingsActions.tourStart.defer()
    }, wait)
  }

  /**
  * Finalizes a re-authentication by ensuring the mailbox re-syncs and reloads
  * @param serviceId: the id of the service
  * @param wait=250: millis to wait before reloading
  */
  _finalizeReauthentication (serviceId, wait = 250) {
    if (serviceId) {
      setTimeout(() => { accountDispatch.reload(serviceId) }, wait)
    }
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Mailbox Auth callbacks
  /* **************************************************************************/

  handleAuthFailure ({ evt, data }) {
    this.preventDefault()
    window.location.hash = '/'
    if (data.errorMessage.toLowerCase().startsWith('user')) {
      // user cancelled. no-op
    } else {
      console.error('[AUTH ERR]', data)
    }
  }

  handleAuthGoogleSuccess ({ mode, context, auth }) {
    this.preventDefault()
    Promise.resolve()
      .then(() => GoogleHTTP.upgradeAuthCodeToPermenant(auth.temporaryCode, auth.codeRedirectUri))
      .then((permenantAuth) => {
        return GoogleHTTP.fetchAccountProfileWithRawAuth(permenantAuth)
          .then((response) => { // Build the complete auth object
            return {
              ...permenantAuth,
              pushToken: auth.pushToken,
              email: (response.emails.find((a) => a.type === 'account') || {}).value
            }
          })
      })
      .then((permenantAuth) => {
        if (mode === AUTH_MODES.TEMPLATE_CREATE) {
          // Create the auth
          actions.createAuth.defer(
            GoogleAuth.createJS(context.id, undefined, permenantAuth)
          )

          // Create the account
          const template = new ACTemplatedAccount(context.template)
          this._createMailboxFromTemplate(context.id, template)
          this._finalizeCreateAccount(`/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${context.id}`)
        } else if (mode === AUTH_MODES.REAUTHENTICATE) {
          if (this.hasMailboxAuth(context.authId)) {
            actions.reduceAuth.defer(
              context.authId,
              AuthReducer.setAuthData,
              permenantAuth
            )
          } else {
            actions.createAuth.defer(
              GoogleAuth.createJS(context.id, undefined, permenantAuth)
            )
          }

          this._finalizeReauthentication(context.serviceId)
        }
      })
      .catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  handleAuthSlackSuccess ({ mode, context, auth }) {
    this.preventDefault()
    Promise.resolve()
      .then(() => SlackHTTP.testAuth(auth.token))
      .then((userInfo) => {
        const authData = {
          access_token: auth.token,
          url: userInfo.url,
          team_name: userInfo.team,
          team_id: userInfo.team_id,
          user_name: userInfo.user,
          user_id: userInfo.user_id
        }
        if (mode === AUTH_MODES.TEMPLATE_CREATE) {
          // Create the auth
          actions.createAuth.defer(
            SlackAuth.createJS(context.id, undefined, authData)
          )

          // Create the account
          const template = new ACTemplatedAccount(context.template)
          this._createMailboxFromTemplate(context.id, template)
          this._finalizeCreateAccount()
        } else if (mode === AUTH_MODES.REAUTHENTICATE) {
          if (this.hasMailboxAuth(context.authId)) {
            actions.reduceAuth.defer(
              context.authId,
              AuthReducer.setAuthData,
              authData
            )
          } else {
            actions.createAuth.defer(
              SlackAuth.createJS(context.id, undefined, authData)
            )
          }

          this._finalizeReauthentication(context.serviceId)
        }
      })
      .catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  handleAuthTrelloSuccess ({ mode, context, auth }) {
    this.preventDefault()

    const authData = {
      authToken: auth.token,
      authAppKey: auth.appKey
    }

    if (mode === AUTH_MODES.TEMPLATE_CREATE) {
      // Create the auth
      actions.createAuth.defer(
        TrelloAuth.createJS(context.id, undefined, authData)
      )

      // Create the account
      const template = new ACTemplatedAccount(context.template)
      this._createMailboxFromTemplate(context.id, template)
      this._finalizeCreateAccount()
    } else if (mode === AUTH_MODES.REAUTHENTICATE) {
      if (this.hasMailboxAuth(context.authId)) {
        actions.reduceAuth.defer(
          context.authId,
          AuthReducer.setAuthData,
          authData
        )
      } else {
        actions.createAuth.defer(
          TrelloAuth.createJS(context.id, undefined, authData)
        )
      }

      this._finalizeReauthentication(context.serviceId)
    }
  }

  handleAuthMicrosoftSuccess ({ mode, context, auth }) {
    this.preventDefault()
    Promise.resolve()
      .then(() => MicrosoftHTTP.upgradeAuthCodeToPermenant(auth.temporaryCode, auth.codeRedirectUri, 2))
      .then((permenantAuth) => {
        const authData = {
          ...permenantAuth,
          accessMode: context.template.accessMode,
          protocolVersion: 2
        }

        if (mode === AUTH_MODES.TEMPLATE_CREATE) {
          // Create the auth
          actions.createAuth.defer(
            MicrosoftAuth.createJS(context.id, undefined, authData)
          )

          // Create the account
          const template = new ACTemplatedAccount(context.template)
          this._createMailboxFromTemplate(context.id, template)
          this._finalizeCreateAccount(`/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${context.id}`)
        } else if (mode === AUTH_MODES.REAUTHENTICATE) {
          if (this.hasMailboxAuth(context.authId)) {
            actions.reduceAuth.defer(
              context.authId,
              AuthReducer.setAuthData,
              authData
            )
          } else {
            actions.createAuth.defer(
              MicrosoftAuth.createJS(context.id, undefined, authData)
            )
          }

          this._finalizeReauthentication(context.serviceId)
        }
      }).catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  handleReauthenticateService ({ serviceId }) {
    this.preventDefault()
    const service = this.getService(serviceId)
    if (!service) { return }

    switch (service.type) {
      case SERVICE_TYPES.GOOGLE_INBOX:
      case SERVICE_TYPES.GOOGLE_MAIL:
        window.location.hash = '/mailbox/reauthenticating'
        ipcRenderer.send(WB_AUTH_GOOGLE, {
          partitionId: service.partition,
          credentials: Bootstrap.credentials,
          mode: AUTH_MODES.REAUTHENTICATE,
          context: {
            id: service.parentId,
            authId: CoreACAuth.compositeId(service.parentId, service.supportedAuthNamespace),
            serviceId: service.id
          }
        })
        break
      case SERVICE_TYPES.MICROSOFT:
        window.location.hash = '/mailbox/reauthenticating'
        ipcRenderer.send(WB_AUTH_MICROSOFT, {
          partitionId: service.partition,
          credentials: Bootstrap.credentials,
          mode: AUTH_MODES.REAUTHENTICATE,
          context: {
            id: service.parentId,
            authId: CoreACAuth.compositeId(service.parentId, service.supportedAuthNamespace),
            serviceId: service.id
          }
        })
        break
      case SERVICE_TYPES.SLACK:
        window.location.hash = '/mailbox/reauthenticating'
        ipcRenderer.send(WB_AUTH_SLACK, {
          partitionId: service.partition,
          credentials: Bootstrap.credentials,
          mode: AUTH_MODES.REAUTHENTICATE,
          context: {
            id: service.parentId,
            authId: CoreACAuth.compositeId(service.parentId, service.supportedAuthNamespace),
            serviceId: service.id
          }
        })
        break
      case SERVICE_TYPES.TRELLO:
        window.location.hash = '/mailbox/reauthenticating'
        ipcRenderer.send(WB_AUTH_SLACK, {
          partitionId: service.partition,
          credentials: Bootstrap.credentials,
          mode: AUTH_MODES.TRELLO,
          context: {
            id: service.parentId,
            authId: CoreACAuth.compositeId(service.parentId, service.supportedAuthNamespace),
            serviceId: service.id
          }
        })
        break
    }
  }

  /* **************************************************************************/
  // Connection & Sync
  /* **************************************************************************/

  handleFullSyncService ({ serviceId }) {
    this.preventDefault()
    const service = this.getService(serviceId)
    if (!service) { return }

    switch (service.type) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
        googleActions.syncServiceProfile.defer(serviceId)
        googleActions.connectService.defer(serviceId)
        googleActions.registerServiceWatch.defer(serviceId)
        googleActions.syncServiceMessages.defer(serviceId, true)
        break
      case SERVICE_TYPES.TRELLO:
        trelloActions.syncServiceProfile.defer(serviceId)
        trelloActions.syncServiceNotifications.defer(serviceId)
        break
      case SERVICE_TYPES.SLACK:
        slackActions.connectService.defer(serviceId)
        slackActions.updateUnreadCounts.defer(serviceId)
        break
      case SERVICE_TYPES.MICROSOFT_MAIL:
        microsoftActions.syncServiceProfile.defer(serviceId)
        microsoftActions.syncServiceMail.defer(serviceId)
        break
    }
  }

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
