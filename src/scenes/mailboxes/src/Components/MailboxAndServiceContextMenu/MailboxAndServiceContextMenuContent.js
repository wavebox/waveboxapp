import PropTypes from 'prop-types'
import React from 'react'
import { MenuItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core'
import { accountActions, accountDispatch, accountStore, AccountLinker } from 'stores/account'
import { settingsStore, settingsActions } from 'stores/settings'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import red from '@material-ui/core/colors/red'
import green from '@material-ui/core/colors/green'
import SleepAllIcon from './SleepAllIcon'
import DeleteAllIcon from './DeleteAllIcon'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import AlarmIcon from '@material-ui/icons/Alarm'
import HotelIcon from '@material-ui/icons/Hotel'
import RefreshIcon from '@material-ui/icons/Refresh'
import SyncIcon from '@material-ui/icons/Sync'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp'
import LayersClearIcon from '@material-ui/icons/LayersClear'
import DeleteIcon from '@material-ui/icons/Delete'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ServiceSidebarIcon from './ServiceSidebarIcon'
import ServiceToolbarStartIcon from './ServiceToolbarStartIcon'
import ServiceToolbarEndIcon from './ServiceToolbarEndIcon'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'

const ITEM_TYPES = Object.freeze({
  DIVIDER: 'DIVIDER',
  INFO: 'INFO',
  SERVICE_OPEN_NEW: 'SERVICE_OPEN_NEW',
  SERVICE_OPEN_NEW_BLANK: 'SERVICE_OPEN_NEW_BLANK',
  SERVICE_SLEEP: 'SERVICE_SLEEP',
  MAILBOX_SLEEP: 'MAILBOX_SLEEP',
  SERVICE_RELOAD: 'SERVICE_RELOAD',
  MAILBOX_RELOAD: 'MAILBOX_RELOAD',
  RESYNC_SERVICE: 'RESYNC_SERVICE',
  RESYNC_MAILBOX: 'RESYNC_MAILBOX',
  SERVICE_REAUTHENTICATE: 'SERVICE_REAUTHENTICATE',
  MAILBOX_SETTINGS: 'MAILBOX_SETTINGS',
  SERVICE_SETTINGS: 'SERVICE_SETTINGS',
  MAILBOX_SERVICE_POSITIONING: 'MAILBOX_SERVICE_POSITIONING',
  SERVICE_SERVICE_POSITIONING: 'SERVICE_SERVICE_POSITIONING',
  MAILBOX_ARTIFICIALLY_PERSIST_COOKIES: 'MAILBOX_ARTIFICIALLY_PERSIST_COOKIES',
  MAILBOX_ADD_SERVICE: 'MAILBOX_ADD_SERVICE',
  DELETE_MAILBOX: 'DELETE_MAILBOX',
  DELETE_SERVICE: 'DELETE_SERVICE',
  BAR_LOCK: 'BAR_LOCK',
  GOOGLE_INBOX_CONVERT: 'GOOGLE_INBOX_CONVERT'
})

export default class MailboxAndServiceContextMenuContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    userStore.listen(this.userChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    userStore.unlisten(this.userChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateAccountState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    ...this.generateAccountState(this.props),
    userHasSleepable: userStore.getState().user.hasSleepable,
    lockSidebarsAndToolbars: settingsStore.getState().ui.lockSidebarsAndToolbars
  }

  /**
  * Generates the account state
  * @param props: the props to use
  * @param accountState=autoget: the account state to use
  */
  generateAccountState (props, accountState = accountStore.getState()) {
    const { mailboxId, serviceId } = props
    const mailbox = accountState.getMailbox(mailboxId)
    const mailboxShimService = accountState.activeServiceIdInMailbox(mailboxId) || mailbox.allServices[0]
    const service = accountState.getService(serviceId)

    return {
      mailbox: mailbox,
      ...(mailbox ? {
        serviceCount: mailbox.allServiceCount,
        mailboxDisplayName: accountState.resolvedMailboxDisplayName(mailboxId),
        mailboxShimService: mailboxShimService,
        mailboxShimServiceSleeping: accountState.isServiceSleeping(mailboxShimService)
      } : {
        serviceCount: 0,
        mailboxDisplayName: 'Untitled',
        mailboxShimService: undefined,
        mailboxShimServiceSleeping: true
      }),
      ...(serviceId ? {
        service: accountState.getService(serviceId),
        serviceDisplayName: accountState.resolvedServiceDisplayName(serviceId),
        isServiceSleeping: accountState.isServiceSleeping(serviceId),
        isServiceActive: accountState.isServiceActive(serviceId),
        isServiceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId),
        serviceType: service.type
      } : {
        service: null,
        serviceDisplayName: 'Untitled',
        isServiceSleeping: false,
        isServiceActive: false,
        isServiceAuthInvalid: false,
        serviceType: null
      })
    }
  }

  accountChanged = (accountState) => {
    this.setState(this.generateAccountState(this.props, accountState))
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      lockSidebarsAndToolbars: settingsState.ui.lockSidebarsAndToolbars
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evt: the event that fired
  * @param callback=undefined: executed on completion
  */
  closePopover = (evt, callback = undefined) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.props.onRequestClose(evt)
    if (typeof (callback) === 'function') {
      setTimeout(() => { callback() }, 300)
    }
  }

  /**
  * Deletes this mailbox
  * @param evt: the event that fired
  */
  handleDelete = (evt) => {
    window.location.hash = `/mailbox_delete/${this.props.mailboxId}`
    this.closePopover(evt)
  }

  /**
  * Deletes a service
  * @param evt: the event that fired
  */
  handleDeleteService = (evt) => {
    window.location.hash = `/mailbox_service_delete/${this.props.mailboxId}/${this.props.serviceId}`
    this.closePopover(evt)
  }

  /**
  * Reloads this service
  * @param evt: the event that fired
  */
  handleReloadService = (evt) => {
    const { isServiceSleeping } = this.state
    const { serviceId } = this.props
    if (isServiceSleeping) {
      this.closePopover(evt, () => {
        accountActions.awakenService(serviceId)
        accountActions.changeActiveService(serviceId)
      })
    } else {
      this.closePopover(evt, () => {
        accountActions.changeActiveService(serviceId)
        accountDispatch.reloadService(serviceId)
      })
    }
  }

  /**
  * Reloads the active service in a mailbox
  * @param evt: the event that fired
  */
  handleReloadMailbox = (evt) => {
    const { mailboxShimService, mailboxShimServiceSleeping } = this.state
    if (mailboxShimServiceSleeping) {
      this.closePopover(evt, () => {
        accountActions.awakenService(mailboxShimService)
        accountActions.changeActiveService(mailboxShimService)
      })
    } else {
      this.closePopover(evt, () => {
        accountActions.changeActiveService(mailboxShimService)
        accountDispatch.reloadService(mailboxShimService)
      })
    }
  }

  /**
  * Re-syncs the mailbox
  * @param evt: the event that fired
  */
  handleResyncMailbox = (evt) => {
    accountActions.userRequestsMailboxSync(this.props.mailboxId)
    this.closePopover(evt)
  }

  /**
  * Re-syncs the service
  * @param evt: the event that fired
  */
  handleResyncService = (evt) => {
    if (this.props.serviceId) {
      accountActions.userRequestsServiceSync(this.props.serviceId)
    }
    this.closePopover(evt)
  }

  /**
  * Handles the user requesting an account reauthentication
  * @param evt: the event that fired
  */
  handleClearBrowserSession = (evt) => {
    accountActions.clearMailboxBrowserSession(this.props.mailboxId)
    this.closePopover(evt)
  }

  /**
  * Handles opening the account settings
  * @param evt: the event that fired
  */
  handleMailboxSettings = (evt) => {
    this.closePopover(evt, () => {
      window.location.hash = `/settings/accounts/${this.props.mailboxId}`
    })
  }

  /**
  * Handles opening the account settings
  * @param evt: the event that fired
  */
  handleServiceSettings = (evt) => {
    if (this.props.serviceId) {
      this.closePopover(evt, () => {
        window.location.hash = `/settings/accounts/${this.props.mailboxId}:${this.props.serviceId}`
      })
    } else {
      this.closePopover(evt, () => {
        window.location.hash = `/settings/accounts/${this.props.mailboxId}`
      })
    }
  }

  /**
  * Handles reauthenticting the mailbox
  * @param evt: the event that fired
  */
  handleReauthenticate = (evt) => {
    accountActions.reauthenticateService(this.props.serviceId)
    this.closePopover(evt)
  }

  /**
  * Handles waking the service
  * @param evt: the event that fired
  */
  handleAwakenService = (evt) => {
    this.closePopover(evt, () => {
      accountActions.awakenService(this.props.serviceId)
    })
  }

  /**
  * Handles sleeping the service
  * @param evt: the event that fired
  */
  handleSleepService = (evt) => {
    const { serviceId } = this.props
    this.closePopover(evt, () => {
      accountActions.sleepService(serviceId, true)
    })
  }

  /**
  * Handles sleeping all services
  * @param evt: the event that fired
  */
  handleSleepAllServices = (evt) => {
    const { mailboxId } = this.props
    this.closePopover(evt, () => {
      accountActions.sleepAllServicesInMailbox(mailboxId, true)
    })
  }

  /**
  * Handles opening a service in a new window
  * @param evt: the event that fired
  */
  handleOpenInWindow = (evt) => {
    const { serviceId } = this.props
    this.closePopover(evt)
    const url = accountDispatch.getCurrentUrl(serviceId) || this.state.service.url
    AccountLinker.openContentWindow(serviceId, url)
  }

  /**
  * Handles opening a blank window in this scope
  * @param evt: the event that fired
  */
  handleOpenBlankWindow = (evt) => {
    const { serviceId } = this.props
    this.closePopover(evt)
    AccountLinker.openContentWindow(serviceId, '')
  }

  handleAddService = (evt) => {
    this.closePopover(evt, () => {
      window.location.hash = `/mailbox_wizard/add/${this.props.mailboxId}`
    })
  }

  handleMoveServiceToSidebar = (evt) => {
    const { mailboxId, serviceId } = this.props
    this.closePopover(evt, () => {
      accountActions.reduceMailbox(mailboxId, MailboxReducer.addServiceToSidebar, serviceId)
    })
  }

  handleMoveServiceToToolbarStart = (evt) => {
    const { mailboxId, serviceId } = this.props
    this.closePopover(evt, () => {
      accountActions.reduceMailbox(mailboxId, MailboxReducer.addServiceToToolbarStart, serviceId)
    })
  }

  handleMoveServiceToToolbarEnd = (evt) => {
    const { mailboxId, serviceId } = this.props
    this.closePopover(evt, () => {
      accountActions.reduceMailbox(mailboxId, MailboxReducer.addServiceToToolbarEnd, serviceId)
    })
  }

  handleMoveAllServicesToSidebar = (evt) => {
    const { mailboxId } = this.props
    this.closePopover(evt, () => {
      accountActions.reduceMailbox(mailboxId, MailboxReducer.moveAllServicesToSidebar)
    })
  }

  handleMoveAllServicesToToolbarStart = (evt) => {
    const { mailboxId } = this.props
    this.closePopover(evt, () => {
      accountActions.reduceMailbox(mailboxId, MailboxReducer.moveAllServicesToToolbarStart)
    })
  }

  handleMoveAllServicesToToolbarEnd = (evt) => {
    const { mailboxId } = this.props
    this.closePopover(evt, () => {
      accountActions.reduceMailbox(mailboxId, MailboxReducer.moveAllServicesToToolbarEnd)
    })
  }

  handleToggleBarLock = (evt) => {
    const { lockSidebarsAndToolbars } = this.state
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setLockSidebarsAndToolbars(!lockSidebarsAndToolbars)
    })
  }

  handleConvertGoogleInboxToGmail = (evt, duplicateFirst) => {
    const { serviceId } = this.props
    this.closePopover(evt, () => {
      accountActions.convertGoogleInboxToGmail(serviceId, duplicateFirst)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders a menu item
  * @param type: the type of menu item to render
  */
  renderItem (type) {
    const { serviceId } = this.props
    const {
      mailbox,
      service,
      mailboxDisplayName,
      serviceCount,
      isServiceSleeping,
      isServiceAuthInvalid,
      serviceDisplayName,
      lockSidebarsAndToolbars
    } = this.state

    const serviceUiLocation = service
      ? mailbox.uiLocationOfServiceWithId(serviceId)
      : undefined

    switch (type) {
      case ITEM_TYPES.DIVIDER:
        return (<Divider />)
      case ITEM_TYPES.INFO:
        return (
          <MenuItem disabled>
            <ListItemText primary={service
              ? `${serviceDisplayName} : (${service.humanizedTypeShort})`
              : mailboxDisplayName
            } />
          </MenuItem>
        )
      case ITEM_TYPES.SERVICE_OPEN_NEW:
        return (
          <MenuItem onClick={this.handleOpenInWindow}>
            <ListItemIcon><OpenInNewIcon /></ListItemIcon>
            <ListItemText inset primary='Open in New Window' />
          </MenuItem>
        )
      case ITEM_TYPES.SERVICE_OPEN_NEW_BLANK:
        return (
          <MenuItem onClick={this.handleOpenBlankWindow}>
            <ListItemIcon><OpenInNewIcon /></ListItemIcon>
            <ListItemText inset primary='Open a New Window in this service' />
          </MenuItem>
        )
      case ITEM_TYPES.SERVICE_SLEEP:
        return (
          <MenuItem onClick={isServiceSleeping ? this.handleAwakenService : this.handleSleepService}>
            <ListItemIcon>
              {isServiceSleeping ? (<AlarmIcon />) : (<HotelIcon />)}
            </ListItemIcon>
            <ListItemText inset primary={isServiceSleeping ? 'Awaken' : 'Sleep'} />
          </MenuItem>
        )
      case ITEM_TYPES.MAILBOX_SLEEP:
        return (
          <MenuItem onClick={this.handleSleepAllServices}>
            <ListItemIcon><SleepAllIcon /></ListItemIcon>
            <ListItemText inset primary={`Sleep ${serviceCount} Services`} />
          </MenuItem>
        )
      case ITEM_TYPES.SERVICE_RELOAD:
        return (
          <MenuItem onClick={this.handleReloadService}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText inset primary='Reload' />
          </MenuItem>
        )
      case ITEM_TYPES.MAILBOX_RELOAD:
        return (
          <MenuItem onClick={this.handleReloadMailbox}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText inset primary='Reload' />
          </MenuItem>
        )
      case ITEM_TYPES.RESYNC_MAILBOX:
        return (
          <MenuItem onClick={this.handleResyncMailbox}>
            <ListItemIcon><SyncIcon /></ListItemIcon>
            <ListItemText inset primary='Resync' />
          </MenuItem>
        )
      case ITEM_TYPES.RESYNC_SERVICE:
        return (
          <MenuItem onClick={this.handleResyncService}>
            <ListItemIcon><SyncIcon /></ListItemIcon>
            <ListItemText inset primary='Resync' />
          </MenuItem>
        )
      case ITEM_TYPES.SERVICE_REAUTHENTICATE:
        return (
          <MenuItem onClick={this.handleReauthenticate}>
            <ListItemIcon>
              {isServiceAuthInvalid ? (
                <ErrorOutlineIcon style={{ color: red[600] }} />
              ) : (
                <FingerprintIcon />
              )}
            </ListItemIcon>
            <ListItemText inset primary='Reauthenticate' style={isServiceAuthInvalid ? { color: red[600] } : undefined} />
          </MenuItem>
        )
      case ITEM_TYPES.MAILBOX_SETTINGS:
        return (
          <MenuItem onClick={this.handleMailboxSettings}>
            <ListItemIcon><SettingsSharpIcon /></ListItemIcon>
            <ListItemText inset primary='Account Settings' />
          </MenuItem>
        )
      case ITEM_TYPES.SERVICE_SETTINGS:
        return (
          <MenuItem onClick={this.handleServiceSettings}>
            <ListItemIcon><SettingsSharpIcon /></ListItemIcon>
            <ListItemText inset primary='Account Settings' />
          </MenuItem>
        )
      case ITEM_TYPES.MAILBOX_SERVICE_POSITIONING:
        return (
          <span>
            <MenuItem onClick={this.handleMoveAllServicesToSidebar}>
              <ListItemIcon><ServiceSidebarIcon /></ListItemIcon>
              <ListItemText inset primary='Move all services to the sidebar' />
            </MenuItem>
            <MenuItem onClick={this.handleMoveAllServicesToToolbarStart}>
              <ListItemIcon><ServiceToolbarStartIcon /></ListItemIcon>
              <ListItemText inset primary='Move all services to the toolbar (left)' />
            </MenuItem>
            <MenuItem onClick={this.handleMoveAllServicesToToolbarEnd}>
              <ListItemIcon><ServiceToolbarEndIcon /></ListItemIcon>
              <ListItemText inset primary='Move all services to the toolbar (right)' />
            </MenuItem>
          </span>
        )
      case ITEM_TYPES.SERVICE_SERVICE_POSITIONING:
        return (
          <span>
            {serviceUiLocation !== ACMailbox.SERVICE_UI_LOCATIONS.SIDEBAR ? (
              <MenuItem onClick={this.handleMoveServiceToSidebar}>
                <ListItemIcon><ServiceSidebarIcon /></ListItemIcon>
                <ListItemText inset primary='Move service to the sidebar' />
              </MenuItem>
            ) : undefined}
            {serviceUiLocation !== ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_START ? (
              <MenuItem onClick={this.handleMoveServiceToToolbarStart}>
                <ListItemIcon><ServiceToolbarStartIcon /></ListItemIcon>
                <ListItemText inset primary='Move service to the toolbar (left)' />
              </MenuItem>
            ) : undefined}
            {serviceUiLocation !== ACMailbox.SERVICE_UI_LOCATIONS.TOOLBAR_END ? (
              <MenuItem onClick={this.handleMoveServiceToToolbarEnd}>
                <ListItemIcon><ServiceToolbarEndIcon /></ListItemIcon>
                <ListItemText inset primary='Move service to the toolbar (right)' />
              </MenuItem>
            ) : undefined}
          </span>
        )
      case ITEM_TYPES.MAILBOX_ARTIFICIALLY_PERSIST_COOKIES:
        return (
          <MenuItem onClick={this.handleClearBrowserSession}>
            <ListItemIcon><LayersClearIcon /></ListItemIcon>
            <ListItemText inset primary='Clear All Cookies' />
          </MenuItem>
        )
      case ITEM_TYPES.MAILBOX_ADD_SERVICE:
        return (
          <MenuItem onClick={this.handleAddService}>
            <ListItemIcon><LibraryAddIcon /></ListItemIcon>
            <ListItemText inset primary='Add another service' />
          </MenuItem>
        )
      case ITEM_TYPES.DELETE_MAILBOX:
        return (
          <MenuItem onClick={this.handleDelete}>
            <ListItemIcon>
              {mailbox.hasMultipleServices ? (<DeleteAllIcon />) : (<DeleteIcon />)}
            </ListItemIcon>
            <ListItemText
              inset
              primary={mailbox.hasMultipleServices ? `Delete Account (${mailbox.allServiceCount} services)` : 'Delete Account'} />
          </MenuItem>
        )
      case ITEM_TYPES.DELETE_SERVICE:
        return (
          <MenuItem onClick={this.handleDeleteService}>
            <ListItemIcon><DeleteIcon /></ListItemIcon>
            <ListItemText inset primary={`Delete ${service.humanizedType}`} />
          </MenuItem>
        )
      case ITEM_TYPES.BAR_LOCK:
        return (
          <MenuItem onClick={this.handleToggleBarLock}>
            <ListItemIcon>
              {lockSidebarsAndToolbars ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
            </ListItemIcon>
            <ListItemText
              inset
              primary={`${lockSidebarsAndToolbars ? 'Unlock' : 'Lock'} sidebar & toolbars`} />
          </MenuItem>
        )
      case ITEM_TYPES.GOOGLE_INBOX_CONVERT:
        return (
          <MenuItem onClick={(evt) => this.handleConvertGoogleInboxToGmail(evt, false)}>
            <ListItemIcon>
              <CompareArrowsIcon style={{ color: green[700] }} />
            </ListItemIcon>
            <ListItemText
              inset
              primary={(<span style={{ color: green[700] }}>Convert to Gmail</span>)} />
          </MenuItem>
        )
    }
  }

  /**
  * Looks to see if the service is priority
  * @param mailbox: the mailbox
  * @param service: the service
  * @return true if the service is high priority
  */
  isServicePriority (mailbox, service) {
    if (!service) { return false }
    if (mailbox.sidebarFirstServicePriority === ACMailbox.SIDEBAR_FIRST_SERVICE_PRIORITY.NORMAL) { return false }
    if (service.id !== mailbox.sidebarServices[0]) { return false }

    return true
  }

  render () {
    const {
      mailbox,
      service,
      serviceCount,
      userHasSleepable,
      serviceType
    } = this.state
    if (!mailbox) { return false }

    const serviceIsPriority = this.isServicePriority(mailbox, service)

    return (
      <span>
        {/* Info & Util */}
        {this.renderItem(ITEM_TYPES.INFO)}
        {serviceType === SERVICE_TYPES.GOOGLE_INBOX ? this.renderItem(ITEM_TYPES.GOOGLE_INBOX_CONVERT) : undefined}
        {service ? this.renderItem(ITEM_TYPES.SERVICE_OPEN_NEW) : undefined}
        {service ? this.renderItem(ITEM_TYPES.SERVICE_OPEN_NEW_BLANK) : undefined}

        {/* Sleep */}
        {userHasSleepable && service ? this.renderItem(ITEM_TYPES.SERVICE_SLEEP) : undefined}
        {userHasSleepable && serviceCount > 1 ? this.renderItem(ITEM_TYPES.MAILBOX_SLEEP) : undefined}

        {/* Reload & Sync & Auth */}
        {this.renderItem(service ? ITEM_TYPES.SERVICE_RELOAD : ITEM_TYPES.MAILBOX_RELOAD)}
        {this.renderItem(service && !serviceIsPriority ? ITEM_TYPES.RESYNC_SERVICE : ITEM_TYPES.RESYNC_MAILBOX)}
        {service && service.supportedAuthNamespace ? this.renderItem(ITEM_TYPES.SERVICE_REAUTHENTICATE) : undefined}

        {this.renderItem(ITEM_TYPES.DIVIDER)}

        {/* Settings */}
        {this.renderItem(service && !serviceIsPriority ? ITEM_TYPES.SERVICE_SETTINGS : ITEM_TYPES.MAILBOX_SETTINGS)}
        {mailbox.artificiallyPersistCookies ? this.renderItem(ITEM_TYPES.MAILBOX_ARTIFICIALLY_PERSIST_COOKIES) : undefined}
        {mailbox.hasMultipleServices ? (
          this.renderItem(service && !serviceIsPriority ? ITEM_TYPES.SERVICE_SERVICE_POSITIONING : ITEM_TYPES.MAILBOX_SERVICE_POSITIONING)
        ) : undefined}

        {this.renderItem(ITEM_TYPES.DIVIDER)}

        {/* Add & Delete */}
        {this.renderItem(ITEM_TYPES.MAILBOX_ADD_SERVICE)}
        {mailbox.hasMultipleServices && service ? this.renderItem(ITEM_TYPES.DELETE_SERVICE) : undefined}
        {this.renderItem(ITEM_TYPES.DELETE_MAILBOX)}

        {this.renderItem(ITEM_TYPES.DIVIDER)}

        {/* Global */}
        {this.renderItem(ITEM_TYPES.BAR_LOCK)}
      </span>
    )
  }
}
