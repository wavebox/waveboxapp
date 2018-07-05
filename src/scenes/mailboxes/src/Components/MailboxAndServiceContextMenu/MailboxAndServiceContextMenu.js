import PropTypes from 'prop-types'
import React from 'react'
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core'
import { accountActions, accountDispatch, accountStore, AccountLinker } from 'stores/account'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import red from '@material-ui/core/colors/red'
import SleepAllIcon from './SleepAllIcon'
import DeleteAllIcon from './DeleteAllIcon'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import AlarmIcon from '@material-ui/icons/Alarm'
import HotelIcon from '@material-ui/icons/Hotel'
import RefreshIcon from '@material-ui/icons/Refresh'
import SyncIcon from '@material-ui/icons/Sync'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import LockOutlineIcon from '@material-ui/icons/LockOutline'
import SettingsIcon from '@material-ui/icons/Settings'
import LayersClearIcon from '@material-ui/icons/LayersClear'
import DeleteIcon from '@material-ui/icons/Delete'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'

export default class MailboxAndServiceContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    onRequestClose: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.renderTO = null
    accountStore.listen(this.accountChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    clearTimeout(this.renderTO)
    accountStore.unlisten(this.accountChanged)
    userStore.unlisten(this.userChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateState(nextProps))
    }
    if (this.props.isOpen !== nextProps.isOpen) {
      if (nextProps.isOpen) {
        clearTimeout(this.renderTO)
        this.setState({ rendering: true })
      } else {
        clearTimeout(this.renderTO)
        this.renderTO = setTimeout(() => {
          this.setState({ rendering: false })
        }, 500)
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    ...this.generateAccountState(this.props),
    rendering: this.props.isOpen,
    userHasSleepable: userStore.getState().user.hasSleepable
  }

  /**
  * Generates the account state
  * @param props: the props to use
  * @param accountState=autoget: the account state to use
  */
  generateAccountState (props, accountState = accountStore.getState()) {
    const { mailboxId, serviceId } = props
    const mailbox = accountState.getMailbox(mailboxId)

    return {
      mailbox: mailbox,
      ...(mailbox ? {
        serviceCount: mailbox.allServiceCount,
        mailboxSleepableServiceCount: !!mailbox.allServices.reduce((acc, serviceId) => {
          return acc + accountState.getService(serviceId).sleepable ? 1 : 0
        }, 0)
      } : {
        serviceCount: 0,
        mailboxSleepableServiceCount: 0
      }),
      ...(serviceId ? {
        service: accountState.getService(serviceId),
        serviceDisplayName: accountState.resolvedServiceDisplayName(serviceId),
        isServiceSleeping: accountState.isServiceSleeping(serviceId),
        isServiceActive: accountState.isServiceActive(serviceId),
        isServiceAuthInvalid: accountState.isMailboxAuthInvalidForServiceId(serviceId)
      } : {
        service: null,
        isServiceSleeping: false,
        isServiceActive: false,
        isServiceAuthInvalid: false
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
    this.props.onRequestClose()
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
  * Reloads this mailbox
  * @param evt: the event that fired
  */
  handleReload = (evt) => {
    const { serviceId } = this.props
    accountActions.changeActiveService(serviceId)
    setTimeout(() => {
      accountDispatch.reload(serviceId)
    }, 100) // Give the UI some time to catch up
    this.closePopover(evt)
  }

  /**
  * Re-syncs the mailbox
  * @param evt: the event that fired
  */
  handleResync = (evt) => {
    accountActions.fullSyncService(this.props.serviceId)
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
  handleAccountSettings = (evt) => {
    this.closePopover(evt, () => {
      window.location.hash = `/settings/accounts/${this.props.mailboxId}`
    })
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
    this.closePopover(evt, () => {
      accountActions.sleepService(this.props.serviceId)
    })
  }

  /**
  * Handles sleeping all services
  * @param evt: the event that fired
  */
  handleSleepAllServices = (evt) => {
    this.closePopover(evt, () => {
      accountActions.sleepAllServices(this.props.mailboxId)
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

  handleAddService = (evt) => {
    this.closePopover(evt, () => {
      window.location.hash = `/mailbox_wizard/add/${this.props.mailboxId}`
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isOpen, anchor } = this.props
    const {
      mailbox,
      service,
      rendering,
      serviceCount,
      userHasSleepable,
      isServiceSleeping,
      mailboxSleepableServiceCount,
      isServiceAuthInvalid,
      serviceDisplayName
    } = this.state
    if (!mailbox || !rendering) { return false }

    return (
      <Menu
        open={isOpen}
        anchorEl={anchor}
        MenuListProps={{ dense: true }}
        disableEnforceFocus
        onClose={this.closePopover}>
        {/* Info & Util */}
        <MenuItem disabled>
          <ListItemText primary={service ? (
            `${serviceDisplayName} : (${service.humanizedTypeShort})`
          ) : (
            `${mailbox.displayName} - ${serviceCount} services`
          )} />
        </MenuItem>
        {service ? (
          <MenuItem onClick={this.handleOpenInWindow}>
            <ListItemIcon><OpenInNewIcon /></ListItemIcon>
            <ListItemText inset primary='Open in New Window' />
          </MenuItem>
        ) : undefined}

        {/* Sleep */}
        {userHasSleepable && service && service.sleepable ? (
          <MenuItem onClick={isServiceSleeping ? this.handleAwakenService : this.handleSleepService}>
            <ListItemIcon>
              {isServiceSleeping ? (<AlarmIcon />) : (<HotelIcon />)}
            </ListItemIcon>
            <ListItemText inset primary={isServiceSleeping ? 'Awaken' : 'Sleep'} />
          </MenuItem>
        ) : undefined}
        {userHasSleepable && mailboxSleepableServiceCount > 1 ? (
          <MenuItem onClick={this.handleSleepAllServices}>
            <ListItemIcon><SleepAllIcon /></ListItemIcon>
            <ListItemText inset primary={`Sleep ${mailboxSleepableServiceCount} Services`} />
          </MenuItem>
        ) : undefined}

        {/* Reload & Sync & Auth */}
        {service && !isServiceSleeping ? (
          <MenuItem onClick={this.handleReload}>
            <ListItemIcon><RefreshIcon /></ListItemIcon>
            <ListItemText inset primary='Reload' />
          </MenuItem>
        ) : undefined}
        {service ? (
          <MenuItem onClick={this.handleResync}>
            <ListItemIcon><SyncIcon /></ListItemIcon>
            <ListItemText inset primary='Resync' />
          </MenuItem>
        ) : undefined}
        {service && service.supportedAuthNamespace ? (
          <MenuItem onClick={this.handleReauthenticate}>
            <ListItemIcon>
              {isServiceAuthInvalid ? (
                <ErrorOutlineIcon style={{ color: red[600] }} />
              ) : (
                <LockOutlineIcon />
              )}
            </ListItemIcon>
            <ListItemText inset primary='Reauthenticate' style={isServiceAuthInvalid ? { color: red[600] } : undefined} />
          </MenuItem>
        ) : undefined}

        {service ? (<Divider />) : undefined}

        {/* Settings */}
        <MenuItem onClick={this.handleAccountSettings}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText inset primary='Account Settings' />
        </MenuItem>
        {mailbox.artificiallyPersistCookies ? (
          <MenuItem onClick={this.handleClearBrowserSession}>
            <ListItemIcon><LayersClearIcon /></ListItemIcon>
            <ListItemText inset primary='Clear All Cookies' />
          </MenuItem>
        ) : undefined}

        {/* Add */}
        <MenuItem onClick={this.handleAddService}>
          <ListItemIcon><LibraryAddIcon /></ListItemIcon>
          <ListItemText inset primary='Add another service' />
        </MenuItem>

        {/* Delete */}
        {mailbox.hasMultipleServices && service ? (
          <MenuItem onClick={this.handleDeleteService}>
            <ListItemIcon><DeleteIcon /></ListItemIcon>
            <ListItemText inset primary={`Delete ${service.humanizedType}`} />
          </MenuItem>
        ) : undefined}
        <MenuItem onClick={this.handleDelete}>
          <ListItemIcon>
            {mailbox.hasMultipleServices ? (<DeleteAllIcon />) : (<DeleteIcon />)}
          </ListItemIcon>
          <ListItemText
            inset
            primary={mailbox.hasMultipleServices ? `Delete Account (${mailbox.allServiceCount} services)` : 'Delete Account'} />
        </MenuItem>
      </Menu>
    )
  }
}
