import RendererAccountStore from 'shared/AltStores/Account/RendererAccountStore'
import { STORE_NAME } from 'shared/AltStores/Account/AltAccountIdentifiers'
import alt from '../alt'
import actions from './accountActions'
import settingsActions from '../settings/settingsActions'
import SlackHTTP from '../slack/SlackHTTP'
import MicrosoftHTTP from '../microsoft/MicrosoftHTTP'
import accountDispatch from './accountDispatch'
import Bootstrap from 'R/Bootstrap'
import slackActions from '../slack/slackActions'
import microsoftActions from '../microsoft/microsoftActions'
import userActions from '../user/userActions'
import {
  WB_AUTH_MICROSOFT,
  WB_AUTH_SLACK,
  WB_NEW_WINDOW,
  WB_GUEST_API_SEND_COMMAND,
  WB_IENGINE_AUTH_SERVICE
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
import ACProvisoService from 'shared/Models/ACAccounts/ACProvisoService'
import ACCOUNT_WARNING_TYPES from 'shared/Models/ACAccounts/AccountWarningTypes'
import ServiceFactory from 'shared/Models/ACAccounts/ServiceFactory'
import IENGINE_AUTH_MODES from 'shared/IEngine/IEngineAuthModes'

const AUTH_MODES = Object.freeze({
  TEMPLATE_CREATE: 'TEMPLATE_CREATE',
  REAUTHENTICATE: 'REAUTHENTICATE',
  ATTACH: 'ATTACH'
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
    this._runtimeWarnings_ = new Map()

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
    // Warnings
    /* ****************************************/

    /**
    * Gets all the warnings for a service
    * @param serviceId: the id of the service
    * @return an struct of warnings
    */
    this.getWarningsForService = (serviceId) => {
      return this._runtimeWarnings_.get(serviceId) || {}
    }

    /**
    * Gets a warning for a service
    * @param serviceId: the id of the service
    * @param warningType: the type of warnings to get
    * @return the warning or undefined
    */
    this.getWarningForServiceAndType = (serviceId, warningType) => {
      return this.getWarningsForService(serviceId)[warningType]
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Tabs
      handleSetWebcontentTabId: actions.SET_WEBCONTENT_TAB_ID,
      handleDeleteWebcontentTabId: actions.DELETE_WEBCONTENT_TAB_ID,

      // Navigation
      handleNavigateAndSwitchToService: actions.NAVIGATE_AND_SWITCH_TO_SERVICE,
      handleRunCommandAndSwitchToService: actions.RUN_COMMAND_AND_SWITCH_TO_SERVICE,

      // Warnings
      handleClearRuntimeWarning: actions.CLEAR_RUNTIME_WARNING,

      // Mailbox creation
      handleStartAddMailboxGroup: actions.START_ADD_MAILBOX_GROUP,
      handleAuthMailboxGroupFromTemplate: actions.AUTH_MAILBOX_GROUP_FROM_TEMPLATE,

      // Service attaching
      handleStartAttachNewService: actions.START_ATTACH_NEW_SERVICE,
      handleAuthNewServiceFromProviso: actions.AUTH_NEW_SERVICE_FROM_PROVISO,

      // Mailbox auth callbacks
      handleAuthFailure: actions.AUTH_FAILURE,
      handleAuthSlackSuccess: actions.AUTH_SLACK_SUCCESS,
      handleAuthMicrosoftSuccess: actions.AUTH_MICROSOFT_SUCCESS,

      // Re-auth
      handleReauthenticateService: actions.REAUTHENTICATE_SERVICE,

      // Connection & Sync
      handleFullSyncService: actions.FULL_SYNC_SERVICE,
      handleFullSyncMailbox: actions.FULL_SYNC_MAILBOX,
      handleUserRequestsMailboxSync: actions.USER_REQUESTS_MAILBOX_SYNC,
      handleUserRequestsServiceSync: actions.USER_REQUESTS_SERVICE_SYNC,

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
    if (!service) { return }

    switch (service.type) {
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
    if (!service) { return }

    switch (service.type) {
      case SERVICE_TYPES.SLACK:
        slackActions.disconnectService.defer(service.id)
        break
    }
  }

  /* **************************************************************************/
  // Utils: IEngine
  /* **************************************************************************/

  /**
  * Makes a request to the main thread to authenticate a iengine service
  * @param serviceType: the service to act for
  * @param authConfig: the config to pass
  * @return promise
  */
  _iengineAuthServicePromise (serviceType, authConfig) {
    return new Promise((resolve, reject) => {
      const ret = `${WB_IENGINE_AUTH_SERVICE}_${uuid.v4()}`
      ipcRenderer.once(ret, (evt, err, payload) => { err ? reject(err) : resolve(payload) })
      ipcRenderer.send(WB_IENGINE_AUTH_SERVICE, ret, serviceType, authConfig)
    })
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  handleLoad (payload) {
    super.handleLoad(payload)

    this.serviceIds().forEach((serviceId) => {
      this.connectService(this.getService(serviceId))
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
          case SERVICE_TYPES.MICROSOFT:
            microsoftActions.serviceSyncWatchFieldChange.defer(next.id, changed)
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
  // Navigation
  /* **************************************************************************/

  handleNavigateAndSwitchToService ({ serviceId, url }) {
    this.preventDefault()
    if (!this.hasService(serviceId)) { return }

    if (!this.isServiceActive(serviceId)) {
      actions.changeActiveService.defer(serviceId)
    } else if (this.isServiceSleeping(serviceId)) {
      actions.awakenService.defer(serviceId)
    }

    let tries = 0
    const retrier = setInterval(() => {
      if (accountDispatch.getIsWebviewMounted(serviceId)) {
        accountDispatch.loadUrl(serviceId, url)
        clearInterval(retrier)
      } else {
        tries++
        if (tries > 20) {
          clearInterval(retrier)
        }
      }
    }, 200)
  }

  handleRunCommandAndSwitchToService ({ serviceId, commandString }) {
    this.preventDefault()
    if (!this.hasService(serviceId)) { return }

    if (!this.isServiceActive(serviceId)) {
      actions.changeActiveService.defer(serviceId)
    } else if (this.isServiceSleeping(serviceId)) {
      actions.awakenService.defer(serviceId)
    }

    let tries = 0
    const retrier = setInterval(() => {
      const tabId = this.getWebcontentTabId(serviceId)
      if (tabId !== undefined) {
        ipcRenderer.send(WB_GUEST_API_SEND_COMMAND, tabId, serviceId, commandString)
        clearInterval(retrier)
      } else {
        tries++
        if (tries > 20) {
          clearInterval(retrier)
        }
      }
    }, 200)
  }

  /* **************************************************************************/
  // Warnings
  /* **************************************************************************/

  handleClearRuntimeWarning ({ serviceId, warningType }) {
    const warnings = this._runtimeWarnings_.get(serviceId) || {}
    delete warnings[warningType]
    this._runtimeWarnings_.set(serviceId, warnings)
  }

  /* **************************************************************************/
  // Mailbox Creation
  /* **************************************************************************/
  /**
   * Creation process
   * 1. actions.startAddMailboxGroup
   *    - directs to wizard personalize (step 1) which calls back with template
   * 2. actions.startAddMailboxGroup
   *   2.a Integrated Accounts
   *      2.a.1 directs to wizard (step 1)
   *      2.a.2 Main thread auth call with mode TEMPLATE_CREATE
   *      2.a.3 Auth callback returns (e.g. actions.authGoogleSuccess)
   *         - create auth, create mailbox from template
   *      2.a.4 directs to wizard configre (step 2)
   *   2.b Linked Accounts
   *      2.b.1 create mailbox from template
   *      2.b.2 directs to wizard configure (step 2)
   */

  handleStartAddMailboxGroup ({ templateType, accessMode }) {
    this.preventDefault()
    window.location.hash = `/mailbox_wizard/${templateType}/${accessMode}/0`
  }

  handleAuthMailboxGroupFromTemplate ({ template }) {
    this.preventDefault()

    if ([ACCOUNT_TEMPLATE_TYPES.TRELLO, ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL].includes(template.templateType)) {
      this._iengineAuthMailboxGroupFromTemplate(template)
      return
    }

    const mailboxId = uuid.v4()

    // Optimistically create this to avoid duplication
    const ipcPayload = {
      partitionId: `persist:${mailboxId}`,
      credentials: Bootstrap.credentials,
      mode: AUTH_MODES.TEMPLATE_CREATE,
      context: {
        mailboxId: mailboxId,
        template: template.cloneData()
      }
    }

    switch (template.templateType) {
      case ACCOUNT_TEMPLATE_TYPES.OUTLOOK:
      case ACCOUNT_TEMPLATE_TYPES.OFFICE365:
        window.location.hash = `/mailbox_wizard/${template.templateType}/${template.accessMode}/1/${mailboxId}`
        ipcRenderer.send(WB_AUTH_MICROSOFT, ipcPayload)
        break
      case ACCOUNT_TEMPLATE_TYPES.SLACK:
        window.location.hash = `/mailbox_wizard/${template.templateType}/_/1/${mailboxId}`
        ipcRenderer.send(WB_AUTH_SLACK, ipcPayload)
        break
      case ACCOUNT_TEMPLATE_TYPES.CONTAINER:
        this._createMailboxFromTemplate(mailboxId, template)
        this._finalizeCreateAccountFromTemplate(mailboxId, `/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${mailboxId}`, 0)
        break
      case ACCOUNT_TEMPLATE_TYPES.GENERIC:
        this._createMailboxFromTemplate(mailboxId, template)
        this._finalizeCreateAccountFromTemplate(mailboxId, `/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${mailboxId}`, 0)
        break
    }
  }

  _iengineAuthMailboxGroupFromTemplate (template) {
    const mailboxId = uuid.v4()
    let serviceType
    switch (template.templateType) {
      case ACCOUNT_TEMPLATE_TYPES.TRELLO:
        serviceType = SERVICE_TYPES.TRELLO
        break
      case ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL:
        serviceType = SERVICE_TYPES.GOOGLE_MAIL
        break
    }

    Promise.resolve()
      .then(() => {
        window.location.hash = `/mailbox_wizard/${template.templateType}/_/1/${mailboxId}`
        return this._iengineAuthServicePromise(serviceType, {
          partitionId: `persist:${mailboxId}`,
          authMode: IENGINE_AUTH_MODES.TEMPLATE_CREATE,
          context: {
            mailboxId: mailboxId,
            template: template.cloneData()
          }
        })
      })
      .then(({ context, auth }) => {
        let nextUrl
        if (template.templateType === ACCOUNT_TEMPLATE_TYPES.TRELLO) {
          actions.createAuth.defer(TrelloAuth.createJS(context.mailboxId, auth))
        } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL) {
          actions.createAuth.defer(GoogleAuth.createJS(context.mailboxId, auth))
          nextUrl = `/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${context.mailboxId}`
        }

        const templatedAccount = new ACTemplatedAccount(context.template)
        this._createMailboxFromTemplate(context.mailboxId, templatedAccount)
        this._finalizeCreateAccountFromTemplate(context.mailboxId, nextUrl)
      })
      .catch((e) => {
        console.error('Uncaught auth template error', e)
        window.location.hash = '/'
      })
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
        const ServiceClass = ServiceFactory.serviceClass(serviceType) || CoreACService
        const service = {
          ...ServiceClass.createJS(undefined, mailboxId, serviceType),
          ...template.expando,
          container: container.cloneForService(),
          containerId: containerId,
          containerSAPI: this.getContainerSAPIDataForService(containerId)
        }
        serviceId = service.id
        actions.createService.defer(mailboxId, template.servicesUILocation, service)
      })

      this._openContainerPostInstallUrl(mailboxId, serviceId, container)
    } else if (template.templateType === ACCOUNT_TEMPLATE_TYPES.GENERIC) {
      actions.createMailbox.defer(ACMailbox.createJS(
        mailboxId,
        template.displayName,
        undefined,
        template.templateType
      ))
      template.services.forEach((serviceType) => {
        const ServiceClass = ServiceFactory.serviceClass(serviceType) || CoreACService
        const service = {
          ...ServiceClass.createJS(undefined, mailboxId, serviceType),
          color: template.color,
          ...template.expando
        }
        actions.createService.defer(mailboxId, template.servicesUILocation, service)
      })
    } else {
      actions.createMailbox.defer(ACMailbox.createJS(
        mailboxId,
        template.displayName,
        template.color,
        template.templateType
      ))
      template.services.forEach((serviceType) => {
        const ServiceClass = ServiceFactory.serviceClass(serviceType) || CoreACService
        const service = {
          ...ServiceClass.createJS(undefined, mailboxId, serviceType),
          ...template.expando
        }
        actions.createService.defer(mailboxId, template.servicesUILocation, service)
      })
    }
  }

  /**
  * @param nextUrl='/': the next url to visit
  * @param wait=250: millis to wait before redirecting
  */
  _finalizeCreateAccountFromTemplate (mailboxId, nextUrl = '/', wait = 250) {
    // The final step of account creation takes a couple of seconds to cross the bridge
    // a few times. To not display janky info to the user wait a little before redirecting
    // them
    setTimeout(() => {
      window.location.hash = nextUrl
      actions.changeActiveMailbox.defer(mailboxId)
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
      setTimeout(() => {
        // Make sure we disconnect the sync and connect them again. Do this in
        // case the user changes the auth details, there's sometimes things
        // we only sync on first launch (e.g. slack getting user profile)
        this.disconnectService(this.getService(serviceId))
        this.connectService(this.getService(serviceId))
        actions.fullSyncService(serviceId)
        accountDispatch.reloadService(serviceId)
      }, wait)
    }
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Service attaching
  /* **************************************************************************/
  /**
   * Attaching process
   * 1. actions.startAttachNewService
   *    1.a Integrated Accounts
   *       1.a.1 We already have auth
   *           1.a.1.a call to actions.authNewServiceFromProviso
   *              - create service, attach to mailbox
   *           1.a.1.b directs to wizard configure (step 2)
   *       1.a.2 We don't have any auth
   *          1.a.2.a directs to wizard (step 1)
   *          1.a.2.b Main thread auth call with mode ATTACH
   *          1.a.2.c Auth callback returns (e.g. actions.authGoogleSuccess)
   *              - create service, attach to mailbox
   *          1.a.2.d directs to wizard configure (step 2)
   *    1.b Linked Accounts
   *       1.b.1 directs to wizard personalize (step 1)
   *       1.b.2 call to actions.authNewServiceFromProviso
   *           - create service, attach to mailbox
   *       1.b.3 directs to wizard configure (step 2)
   */

  handleStartAttachNewService ({ attachTarget, serviceType, accessMode }) {
    this.preventDefault()

    if ([SERVICE_TYPES.TRELLO, SERVICE_TYPES.GOOGLE_MAIL].includes(serviceType)) {
      this._iengineAttachNewService(attachTarget, serviceType, accessMode)
      return
    }

    // Optimistically create this to avoid lots of duplication
    const proviso = new ACProvisoService({
      serviceId: uuid.v4(),
      accessMode: accessMode,
      serviceType: serviceType,
      parentId: attachTarget
    })
    const baseIpcPayload = {
      partitionId: `persist:${attachTarget}`,
      credentials: Bootstrap.credentials,
      mode: AUTH_MODES.ATTACH,
      context: {
        mailboxId: attachTarget,
        authId: undefined, // Prefilled later
        proviso: proviso.cloneData()
      }
    }

    if (serviceType === SERVICE_TYPES.MICROSOFT_MAIL) {
      const authId = CoreACAuth.compositeId(attachTarget, MicrosoftAuth.namespace)
      const auth = this.getMailboxAuth(authId)
      if (auth && auth.hasAuth && !auth.isAuthInvalid) {
        actions.authNewServiceFromProviso.defer(proviso)
      } else {
        window.location.hash = `/mailbox_attach_wizard/${attachTarget}/${serviceType}/${accessMode}/1`
        baseIpcPayload.context.authId = authId
        ipcRenderer.send(WB_AUTH_MICROSOFT, baseIpcPayload)
      }
    } else if (serviceType === SERVICE_TYPES.SLACK) {
      const authId = CoreACAuth.compositeId(attachTarget, SlackAuth.namespace)
      const auth = this.getMailboxAuth(authId)
      if (auth && auth.hasAuth && !auth.isAuthInvalid) {
        actions.authNewServiceFromProviso.defer(proviso)
      } else {
        window.location.hash = `/mailbox_attach_wizard/${attachTarget}/${serviceType}/${accessMode}/1`
        baseIpcPayload.context.authId = authId
        ipcRenderer.send(WB_AUTH_SLACK, baseIpcPayload)
      }
    } else if (serviceType === SERVICE_TYPES.GENERIC) {
      window.location.hash = `/mailbox_attach_wizard/${attachTarget}/${serviceType}/${accessMode}/0`
    } else if (serviceType === SERVICE_TYPES.CONTAINER) {
      const container = this.getContainer(accessMode)
      if (!container) {
        console.error('[AUTH ERR]', `Unable to create service with containerId "${accessMode}" it's unknown`)
        return
      }
      if (container.installHasPersonaliseStep) {
        window.location.hash = `/mailbox_attach_wizard/${attachTarget}/${serviceType}/${accessMode}/0`
      } else {
        actions.authNewServiceFromProviso.defer(proviso)
      }
    }
  }

  _iengineAttachNewService (attachTarget, serviceType, accessMode) {
    let authId
    switch (serviceType) {
      case SERVICE_TYPES.TRELLO:
        authId = CoreACAuth.compositeId(attachTarget, TrelloAuth.namespace)
        break
      case SERVICE_TYPES.GOOGLE_MAIL:
        authId = CoreACAuth.compositeId(attachTarget, GoogleAuth.namespace)
        break
    }

    const proviso = new ACProvisoService({
      serviceId: uuid.v4(),
      accessMode: accessMode,
      serviceType: serviceType,
      parentId: attachTarget
    })

    Promise.resolve()
      .then(() => {
        const auth = this.getMailboxAuth(authId)
        if (auth && auth.hasAuth && !auth.isAuthInvalid) {
          return Promise.resolve()
        } else {
          return Promise.resolve()
            .then(() => {
              window.location.hash = `/mailbox_attach_wizard/${attachTarget}/${serviceType}/${accessMode}/1`
              return this._iengineAuthServicePromise(serviceType, {
                partitionId: `persist:${attachTarget}`,
                authMode: IENGINE_AUTH_MODES.ATTACH,
                context: {
                  mailboxId: attachTarget,
                  authId: authId
                }
              })
            })
            .then(({ context, auth }) => {
              window.location.hash = '/'
              if (this.hasMailboxAuth(authId)) {
                actions.reduceAuth(authId, AuthReducer.setAuthData, auth)
              } else {
                switch (serviceType) {
                  case SERVICE_TYPES.TRELLO:
                    actions.createAuth(TrelloAuth.createJS(attachTarget, auth))
                    break
                  case SERVICE_TYPES.GOOGLE_MAIL:
                    actions.createAuth(GoogleAuth.createJS(context.mailboxId, auth))
                    break
                }
              }
              return Promise.resolve()
            })
        }
      })
      .then(() => {
        actions.authNewServiceFromProviso(proviso)
      })
      .catch((e) => {
        console.error('Uncaught attach service error', e)
        window.location.hash = '/'
      })
  }

  handleAuthNewServiceFromProviso ({ proviso }) {
    const mailbox = this.getMailbox(proviso.parentId)
    if (!mailbox) {
      console.error('[AUTH ERR]', `Unable to create service with parentId "${proviso.parentId}" it's unknown`)
      return
    }

    let serviceJS
    if (proviso.serviceType === SERVICE_TYPES.CONTAINER) {
      const container = this.getContainer(proviso.accessMode)
      if (!container) {
        console.error('[AUTH ERR]', `Unable to create service with containerId "${proviso.accessMode}" it's unknown`)
        return
      }

      serviceJS = {
        ...CoreACService.createJS(proviso.serviceId, proviso.parentId, proviso.serviceType),
        ...proviso.expando,
        containerId: proviso.accessMode,
        container: container.cloneForService(),
        containerSAPI: this.getContainerSAPIDataForService(proviso.accessMode)
      }
      this._openContainerPostInstallUrl(proviso.parentId, proviso.serviceId, container)
    } else {
      serviceJS = {
        ...CoreACService.createJS(proviso.serviceId, proviso.parentId, proviso.serviceType),
        ...proviso.expando
      }
    }

    const serviceId = serviceJS.id
    actions.createService.defer(proviso.parentId, mailbox.suggestedServiceUILocation, serviceJS)
    if (proviso.serviceType === SERVICE_TYPES.TRELLO) {
      this._finalizeServiceFromProviso(serviceId, `/`)
    } else if (proviso.serviceType === SERVICE_TYPES.SLACK) {
      this._finalizeServiceFromProviso(serviceId, `/`)
    } else {
      this._finalizeServiceFromProviso(serviceId, `/mailbox_attach_wizard/${proviso.parentId}/${proviso.serviceType}/${proviso.accessMode}/2/${serviceId}`)
    }
  }

  /* **************************************************************************/
  // Service attaching: Utils
  /* **************************************************************************/

  /**
  * @param nextUrl='/': the next url to visit
  * @param wait=250: millis to wait before redirecting
  */
  _finalizeServiceFromProviso (serviceId, nextUrl = '/', wait = 250) {
    // The final step of account creation takes a couple of seconds to cross the bridge
    // a few times. To not display janky info to the user wait a little before redirecting
    // them
    setTimeout(() => {
      window.location.hash = nextUrl
      actions.changeActiveService.defer(serviceId)
      settingsActions.tourStart.defer()
    }, wait)

    // It's bad that we're waiting an arbituary time here, but if the warning doesn't get
    // generated it's not the end of the world. Creation should probably be below 200ms
    // so waiting 2500 gives even the slowest machine enough time to do everything
    setTimeout(() => {
      const service = this.getService(serviceId)
      if (!service) { return }
      const conflict = this.mailboxServices(service.parentId).find((s) => {
        return s.id !== serviceId && s.similarityNamespaceId === service.similarityNamespaceId
      })
      if (!conflict) { return }

      const warnings = this._runtimeWarnings_.get(serviceId) || {}
      warnings[ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH] = {
        type: ACCOUNT_WARNING_TYPES.SERVICE_SIMILARITY_NAMESPACE_CLASH,
        conflictServiceId: conflict.id
      }
      this._runtimeWarnings_.set(serviceId, warnings)
      this.emitChange()
    }, 2500)
  }

  /* **************************************************************************/
  // Service & Mailbox creation utils
  /* **************************************************************************/

  /**
  * Opens a containers post install url
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the id of the service
  * @param container: the container to open for
  */
  _openContainerPostInstallUrl (mailboxId, serviceId, container) {
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
            SlackAuth.createJS(context.mailboxId, authData, context.sandboxedPartitionId)
          )

          // Create the account
          const template = new ACTemplatedAccount(context.template)
          this._createMailboxFromTemplate(context.mailboxId, template)
          this._finalizeCreateAccountFromTemplate(context.mailboxId)
        } else if (mode === AUTH_MODES.REAUTHENTICATE || mode === AUTH_MODES.ATTACH) {
          if (this.hasMailboxAuth(context.authId)) {
            actions.reduceAuth.defer(context.authId, AuthReducer.setAuthData, authData)
          } else {
            actions.createAuth.defer(
              SlackAuth.createJS(context.mailboxId, authData, context.sandboxedPartitionId)
            )
          }

          if (mode === AUTH_MODES.REAUTHENTICATE) {
            this._finalizeReauthentication(context.serviceId)
          } else if (mode === AUTH_MODES.ATTACH) {
            actions.authNewServiceFromProviso.defer(new ACProvisoService(context.proviso))
          }
        }
      })
      .catch((err) => {
        console.error('[AUTH ERR]', err)
      })
  }

  handleAuthMicrosoftSuccess ({ mode, context, auth }) {
    this.preventDefault()
    Promise.resolve()
      .then(() => MicrosoftHTTP.upgradeAuthCodeToPermenant(auth.temporaryCode, auth.codeRedirectUri, 2))
      .then((authData) => {
        if (mode === AUTH_MODES.TEMPLATE_CREATE) {
          // Create the auth
          actions.createAuth.defer(
            MicrosoftAuth.createJS(context.mailboxId, authData, context.sandboxedPartitionId)
          )

          // Create the account
          const template = new ACTemplatedAccount(context.template)
          this._createMailboxFromTemplate(context.mailboxId, template)
          this._finalizeCreateAccountFromTemplate(context.mailboxId, `/mailbox_wizard/${template.templateType}/${template.accessMode}/2/${context.mailboxId}`)
        } else if (mode === AUTH_MODES.REAUTHENTICATE || mode === AUTH_MODES.ATTACH) {
          if (this.hasMailboxAuth(context.authId)) {
            actions.reduceAuth.defer(context.authId, AuthReducer.setAuthData, authData)
          } else {
            actions.createAuth.defer(
              MicrosoftAuth.createJS(context.mailboxId, authData, context.sandboxedPartitionId)
            )
          }

          if (mode === AUTH_MODES.REAUTHENTICATE) {
            this._finalizeReauthentication(context.serviceId)
          } else if (mode === AUTH_MODES.ATTACH) {
            actions.authNewServiceFromProviso.defer(new ACProvisoService(context.proviso))
          }
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

    if ([SERVICE_TYPES.TRELLO, SERVICE_TYPES.GOOGLE_MAIL, SERVICE_TYPES.GOOGLE_INBOX].includes(service.type)) {
      this._iengineReauthenticateServce(service)
      return
    }

    const ipcPayload = {
      partitionId: service.partitionId,
      credentials: Bootstrap.credentials,
      mode: AUTH_MODES.REAUTHENTICATE,
      context: {
        mailboxId: service.parentId,
        authId: CoreACAuth.compositeIdFromService(service),
        serviceId: service.id,
        sandboxedPartitionId: service.sandboxFromMailbox
          ? service.partitionId
          : undefined
      }
    }

    switch (service.type) {
      case SERVICE_TYPES.MICROSOFT_MAIL:
        window.location.hash = '/mailbox/reauthenticating'
        ipcRenderer.send(WB_AUTH_MICROSOFT, ipcPayload)
        break
      case SERVICE_TYPES.SLACK:
        window.location.hash = '/mailbox/reauthenticating'
        ipcRenderer.send(WB_AUTH_SLACK, ipcPayload)
        break
    }
  }

  _iengineReauthenticateServce (service) {
    Promise.resolve()
      .then(() => {
        window.location.hash = '/mailbox/reauthenticating'
        return this._iengineAuthServicePromise(service.type, {
          partitionId: service.partitionId,
          authMode: IENGINE_AUTH_MODES.REAUTHENTICATE,
          context: {
            mailboxId: service.parentId,
            authId: CoreACAuth.compositeIdFromService(service),
            serviceId: service.id,
            sandboxedPartitionId: service.sandboxFromMailbox
              ? service.partitionId
              : undefined
          }
        })
      })
      .then(({ context, auth }) => {
        if (this.hasMailboxAuth(context.authId)) {
          actions.reduceAuth(context.authId, AuthReducer.setAuthData, auth)
        } else {
          switch (service.type) {
            case SERVICE_TYPES.TRELLO:
              actions.createAuth(TrelloAuth.createJS(context.mailboxId, auth, context.sandboxedPartitionId))
              break
            case SERVICE_TYPES.GOOGLE_MAIL:
            case SERVICE_TYPES.GOOGLE_INBOX:
              actions.createAuth(GoogleAuth.createJS(context.mailboxId, auth, context.sandboxedPartitionId))
              break
          }
        }

        this._finalizeReauthentication(context.serviceId)
      })
      .catch((e) => {
        console.error('Uncaught reauthenticate error', e)
        window.location.hash = '/'
      })
  }

  /* **************************************************************************/
  // Connection & Sync
  /* **************************************************************************/

  handleFullSyncService ({ serviceId }) {
    this.preventDefault()
    const service = this.getService(serviceId)
    if (!service) { return }

    switch (service.type) {
      // @Thomas101 when all have been integrated-engine move this into main thread
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

  handleFullSyncMailbox ({ mailboxId }) {
    this.preventDefault()
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) { return }

    mailbox.allServices.forEach((serviceId) => {
      actions.fullSyncService.defer(serviceId)
    })
  }

  handleUserRequestsMailboxSync ({ mailboxId }) {
    this.preventDefault()
    const mailbox = this.getMailbox(mailboxId)
    if (!mailbox) { return }

    mailbox.allServices.forEach((serviceId) => {
      actions.userRequestsServiceSync.defer(serviceId)
    })
  }

  handleUserRequestsServiceSync ({ serviceId }) {
    this.preventDefault()
    const service = this.getService(serviceId)
    if (!service) { return }

    switch (service.type) {
      case SERVICE_TYPES.GOOGLE_MAIL:
      case SERVICE_TYPES.GOOGLE_INBOX:
      case SERVICE_TYPES.TRELLO:
        actions.userRequestsIntegratedServiceSync(serviceId)
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
    this._snapshots_.set(serviceId, snapshot)
  }

  /* **************************************************************************/
  // Handlers : Search
  /* **************************************************************************/

  handleStartSearchingService ({ serviceId = this.activeServiceId() }) {
    if (!serviceId) { this.preventDefault(); return }
    if (this._search_.has(serviceId)) {
      this._search_.set(serviceId, {
        term: this._search_.get(serviceId).term,
        hash: uuid.v4()
      })
    } else {
      this._search_.set(serviceId, {
        term: '',
        hash: uuid.v4()
      })
    }
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
