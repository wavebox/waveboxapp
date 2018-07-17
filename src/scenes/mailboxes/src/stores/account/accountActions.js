import RendererAccountActions from 'shared/AltStores/Account/RendererAccountActions'
import alt from '../alt'
import {
  WB_AUTH_GOOGLE_COMPLETE,
  WB_AUTH_GOOGLE_ERROR,
  WB_AUTH_MICROSOFT_COMPLETE,
  WB_AUTH_MICROSOFT_ERROR,
  WB_AUTH_SLACK_COMPLETE,
  WB_AUTH_SLACK_ERROR,
  WB_AUTH_TRELLO_COMPLETE,
  WB_AUTH_TRELLO_ERROR,

  WB_WINDOW_FIND_START,
  WB_WINDOW_FIND_NEXT
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { ACCOUNT_TEMPLATE_TYPES } from 'shared/Models/ACAccounts/AccountTemplates'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

class AccountActions extends RendererAccountActions {
  /* **************************************************************************/
  // Tab ids
  /* **************************************************************************/

  /**
  * Sets the tab id for a service
  * @param serviceId: the id of the service
  * @param serviceType: the type of service
  * @param tabId: the id of the tab to set
  */
  setWebcontentTabId (serviceId, tabId) {
    return { serviceId, tabId }
  }

  /**
  * Deletes the tab id for a service
  * @param serviceId: the id of the service
  */
  deleteWebcontentTabId (serviceId) {
    return { serviceId }
  }

  /* **************************************************************************/
  // Warnings
  /* **************************************************************************/

  /**
  * Clears a runtime warning
  * @param serviceId: the id of service
  * @param warningType: type of warning to clear
  */
  clearRuntimeWarning (serviceId, warningType) {
    return { serviceId, warningType }
  }

  /* **************************************************************************/
  // Mailbox Creation
  /* **************************************************************************/

  /**
  * Starts adding a mailbox
  * @param templateType: the type of template to add
  * @param accessMode: the access mode to pass to the add wizard
  */
  startAddMailboxGroup (templateType, accessMode) {
    if (ACCOUNT_TEMPLATE_TYPES[templateType]) {
      return { templateType: templateType, accessMode: accessMode || '_' }
    }

    // We also have some classic mappings to work with
    if (templateType === 'GOOGLE') {
      if (accessMode === 'GMAIL') {
        return { templateType: ACCOUNT_TEMPLATE_TYPES.GOOGLE_MAIL, accessMode: accessMode || '_' }
      } else if (accessMode === 'GINBOX') {
        return { templateType: ACCOUNT_TEMPLATE_TYPES.GOOGLE_INBOX, accessMode: accessMode || '_' }
      }
    } else if (templateType === 'MICROSOFT') {
      if (accessMode === 'OUTLOOK') {
        return { templateType: ACCOUNT_TEMPLATE_TYPES.OUTLOOK, accessMode: 'OUTLOOK' }
      } else if (accessMode === 'OFFICE365') {
        return { templateType: ACCOUNT_TEMPLATE_TYPES.OFFICE365, accessMode: 'OFFICE365' }
      }
    }
  }

  /**
  * Creates a mailbox group from a template
  * @param template: the template to use to create the account
  */
  authMailboxGroupFromTemplate (template) {
    return { template: template }
  }

  /* **************************************************************************/
  // Service Attaching
  /* **************************************************************************/

  /**
  * Starts the attach service step
  * @param templateType: the type of template to add
  * @param accessMode: the access mode to pass to the add wizard
  * @param mailboxId: the id of the mailbox to attach to
  */
  startAttachNewService (attachTarget, serviceType, accessMode) {
    if (SERVICE_TYPES[serviceType]) {
      return { attachTarget: attachTarget, serviceType: serviceType, accessMode: accessMode || '_' }
    }

    // We also have some classic mappings to work with
    if (serviceType === 'GOOGLE') {
      if (accessMode === 'GMAIL') {
        return { attachTarget: attachTarget, serviceType: SERVICE_TYPES.GOOGLE_MAIL, accessMode: accessMode || '_' }
      } else if (accessMode === 'GINBOX') {
        return { attachTarget: attachTarget, serviceType: SERVICE_TYPES.GOOGLE_INBOX, accessMode: accessMode || '_' }
      }
    } else if (serviceType === 'MICROSOFT') {
      return { attachTarget: attachTarget, serviceType: SERVICE_TYPES.MICROSOFT_MAIL, accessMode: accessMode || '_' }
    }
  }

  /**
  * Create a service from a service proviso
  * @param proviso: the proviso to use
  */
  authNewServiceFromProviso (proviso) {
    return { proviso: proviso }
  }

  /* **************************************************************************/
  // Mailbox Auth callbacks
  /* **************************************************************************/

  /**
  * Handles an auth request mailbox failing to authenticate
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /**
  * Handles a Google account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authGoogleSuccess (evt, payload) {
    return payload
  }

  /**
  * Handles a Slack account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authSlackSuccess (evt, payload) {
    return payload
  }

  /**
  * Handles a Trello account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authTrelloSuccess (evt, payload) {
    return payload
  }

  /**
  * Handles a Microsoft account authenticating
  * @param evt: the event that came over the ipc
  * @param payload: the data that came across the ipc
  */
  authMicrosoftSuccess (evt, payload) {
    return payload
  }

  /* **************************************************************************/
  // Mailbox Re-auth
  /* **************************************************************************/

  reauthenticateService (serviceId) {
    return { serviceId: serviceId }
  }

  /* **************************************************************************/
  // Sync
  /* **************************************************************************/

  /**
  * Triggers a full sync on a service
  * @param id: the id of the service
  */
  fullSyncService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Triggers a full sync on a mailbox
  * @param id: the id of the mailbox
  */
  fullSyncMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Snapshots
  /* **************************************************************************/

  /**
  * Sets a snapshot of a service
  * @param serviceId: the service type
  * @param snapshot: the snapshot as a base64 string
  */
  setServiceSnapshot (serviceId, snapshot) {
    return { serviceId: serviceId, snapshot: snapshot }
  }

  /* **************************************************************************/
  // Search
  /* **************************************************************************/

  /**
  * Starts searching the service
  * @param serviceId=optional: the service id
  * @param service=optional: the type of service to search for
  */
  startSearchingService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Stops searching the service but in a way that simply stops tracking the search process
  * Best to use this if search is not handled by us to unmount the track
  */
  untrackSearchingService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Stops searching the service
  * @param serviceId=optional: the service id
  */
  stopSearchingService (serviceId) {
    return { serviceId: serviceId }
  }

  /**
  * Sets the search term
  * @param serviceId=optional: the mailbox id
  * @param str: the search string
  */
  setServiceSearchTerm (serviceId, str) {
    return { serviceId: serviceId, str: str }
  }

  /**
  * Searches for the next occurance of the search term
  * @param serviceId=optional: the service id
  */
  searchServiceNextTerm (serviceId) {
    return { serviceId: serviceId }
  }
}

const actions = alt.createActions(AccountActions)

// Auth
ipcRenderer.on(WB_AUTH_GOOGLE_COMPLETE, actions.authGoogleSuccess)
ipcRenderer.on(WB_AUTH_GOOGLE_ERROR, actions.authFailure)
ipcRenderer.on(WB_AUTH_SLACK_COMPLETE, actions.authSlackSuccess)
ipcRenderer.on(WB_AUTH_SLACK_ERROR, actions.authFailure)
ipcRenderer.on(WB_AUTH_TRELLO_COMPLETE, actions.authTrelloSuccess)
ipcRenderer.on(WB_AUTH_TRELLO_ERROR, actions.authFailure)
ipcRenderer.on(WB_AUTH_MICROSOFT_COMPLETE, actions.authMicrosoftSuccess)
ipcRenderer.on(WB_AUTH_MICROSOFT_ERROR, actions.authFailure)

// Mailbox modifiers
ipcRenderer.on(WB_WINDOW_FIND_START, () => actions.startSearchingService())
ipcRenderer.on(WB_WINDOW_FIND_NEXT, () => actions.searchServiceNextTerm())

export default actions
