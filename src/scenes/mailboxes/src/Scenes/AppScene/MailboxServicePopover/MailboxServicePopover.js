import PropTypes from 'prop-types'
import React from 'react'
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from 'material-ui'
import { mailboxActions, mailboxDispatch, mailboxStore, MailboxLinker } from 'stores/mailbox'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import CoreService from 'shared/Models/Accounts/CoreService'
import red from 'material-ui/colors/red'
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

export default class SidelistItemMailboxPopover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string,
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
    mailboxStore.listen(this.mailboxesChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    clearTimeout(this.renderTO)
    mailboxStore.unlisten(this.mailboxesChanged)
    userStore.unlisten(this.userChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
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
    ...this.generateState(),
    rendering: this.props.isOpen
  }

  generateState (props = this.props) {
    const { mailboxId, serviceType } = props
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : null
    const user = userStore.getState().user

    return {
      mailbox: mailbox,
      service: service,
      userHasSleepable: user.hasSleepable,
      userHasServices: user.hasServices,
      isServiceSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isServiceActive: mailboxState.isActive(mailboxId, serviceType)
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    const service = mailbox ? mailbox.serviceForType(serviceType) : null

    this.setState({
      mailbox: mailbox,
      service: service,
      serviceSupportsSleeping: service ? service.sleepable : false,
      isServiceSleeping: mailboxState.isSleeping(mailboxId, serviceType),
      isServiceActive: mailboxState.isActive(mailboxId, serviceType)
    })
  }

  userChanged = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable,
      userHasServices: userState.user.hasServices
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
    window.location.hash = `/mailbox_service_delete/${this.props.mailboxId}/${this.props.serviceType}`
    this.closePopover(evt)
  }

  /**
  * Reloads this mailbox
  * @param evt: the event that fired
  */
  handleReload = (evt) => {
    const { mailboxId, serviceType } = this.props
    mailboxActions.changeActive(mailboxId, serviceType)
    setTimeout(() => {
      mailboxDispatch.reload(mailboxId, serviceType)
    }, 100) // Give the UI some time to catch up
    this.closePopover(evt)
  }

  /**
  * Re-syncs the mailbox
  * @param evt: the event that fired
  */
  handleResync = (evt) => {
    mailboxActions.fullSyncMailbox(this.props.mailboxId)
    this.closePopover(evt)
  }

  /**
  * Handles the user requesting an account reauthentication
  * @param evt: the event that fired
  */
  handleClearBrowserSession = (evt) => {
    mailboxActions.clearMailboxBrowserSession(this.props.mailboxId)
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
    mailboxActions.reauthenticateMailbox(this.props.mailboxId)
    this.closePopover(evt)
  }

  /**
  * Handles waking the service
  * @param evt: the event that fired
  */
  handleAwakenService = (evt) => {
    this.closePopover(evt, () => {
      mailboxActions.awakenService(this.props.mailboxId, this.props.serviceType)
    })
  }

  /**
  * Handles sleeping the service
  * @param evt: the event that fired
  */
  handleSleepService = (evt) => {
    this.closePopover(evt, () => {
      mailboxActions.sleepService(this.props.mailboxId, this.props.serviceType)
    })
  }

  /**
  * Handles sleeping all services
  * @param evt: the event that fired
  */
  handleSleepAllServices = (evt) => {
    this.closePopover(evt, () => {
      mailboxActions.sleepAllServices(this.props.mailboxId)
    })
  }

  /**
  * Handles opening a service in a new window
  * @param evt: the event that fired
  */
  handleOpenInWindow = (evt) => {
    const { mailboxId, serviceType } = this.props
    this.closePopover(evt)
    const url = mailboxDispatch.getCurrentUrl(mailboxId, serviceType) || this.state.service.url
    MailboxLinker.openContentWindow(mailboxId, serviceType, url)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the menu items
  * @return array of jsx elements
  */
  renderMenuItems () {
    const { mailbox, userHasSleepable, userHasServices, isServiceSleeping, service } = this.state
    const menuItems = []

    // Identification & Status
    if (mailbox.displayName) {
      menuItems.push(
        <MenuItem key='info' disabled>
          <ListItemText primary={`${service.humanizedTypeShort} : ${mailbox.displayName}`} />
        </MenuItem>
      )
    }
    menuItems.push(
      <MenuItem key='open_in_window' onClick={this.handleOpenInWindow}>
        <ListItemIcon>
          <OpenInNewIcon />
        </ListItemIcon>
        <ListItemText inset primary='Open in New Window' />
      </MenuItem>
    )
    if (userHasSleepable && (service || {}).sleepable) {
      if (isServiceSleeping) {
        menuItems.push(
          <MenuItem key='awaken' onClick={this.handleAwakenService}>
            <ListItemIcon>
              <AlarmIcon />
            </ListItemIcon>
            <ListItemText inset primary='Awaken' />
          </MenuItem>
        )
      } else {
        menuItems.push(
          <MenuItem key='sleep' onClick={this.handleSleepService}>
            <ListItemIcon>
              <HotelIcon />
            </ListItemIcon>
            <ListItemText inset primary='Sleep' />
          </MenuItem>
        )
      }
    }

    if (userHasSleepable && userHasServices && mailbox.enabledServices.length > 1) {
      const sleepableServices = mailbox.enabledServices.filter((s) => s.sleepable)
      if (sleepableServices.length > 1) {
        menuItems.push(
          <MenuItem key='sleep_all' onClick={this.handleSleepAllServices}>
            <ListItemIcon>
              <SleepAllIcon />
            </ListItemIcon>
            <ListItemText inset primary={`Sleep ${sleepableServices.length} Services`} />
          </MenuItem>
        )
      }
    }
    if (!isServiceSleeping) {
      menuItems.push(
        <MenuItem key='reload' onClick={this.handleReload}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText inset primary='Reload' />
        </MenuItem>
      )
    }
    menuItems.push(
      <MenuItem key='sync' onClick={this.handleResync}>
        <ListItemIcon>
          <SyncIcon />
        </ListItemIcon>
        <ListItemText inset primary='Resync' />
      </MenuItem>
    )
    if (mailbox.supportsAuth) {
      const invalid = mailbox.isAuthenticationInvalid || !mailbox.hasAuth
      menuItems.push(
        <MenuItem key='reauthenticate' onClick={this.handleReauthenticate}>
          <ListItemIcon>
            {invalid ? (
              <ErrorOutlineIcon style={{ color: red[600] }} />
            ) : (
              <LockOutlineIcon />
            )}
          </ListItemIcon>
          <ListItemText inset primary='Reauthenticate' />
        </MenuItem>
      )
    }
    menuItems.push(<Divider key='div-actions' />)

    // Account Settings
    menuItems.push(
      <MenuItem key='settings' onClick={this.handleAccountSettings}>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText inset primary='Account Settings' />
      </MenuItem>
    )
    if (mailbox.artificiallyPersistCookies) {
      menuItems.push(
        <MenuItem key='clearsession' onClick={this.handleClearBrowserSession}>
          <ListItemIcon>
            <LayersClearIcon />
          </ListItemIcon>
          <ListItemText inset primary='Clear All Cookies' />
        </MenuItem>
      )
    }
    // Delete
    if (userHasServices && mailbox.enabledServices.length > 1) {
      if (service.type !== CoreService.SERVICE_TYPES.DEFAULT) {
        menuItems.push(
          <MenuItem key='delete' onClick={this.handleDeleteService}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText inset primary={`Delete ${service.humanizedType}`} />
          </MenuItem>
        )
      }
      menuItems.push(
        <MenuItem key='delete_all' onClick={this.handleDelete}>
          <ListItemIcon>
            <DeleteAllIcon />
          </ListItemIcon>
          <ListItemText inset primary={`Delete Account (${mailbox.enabledServices.length} services)`} />
        </MenuItem>
      )
    } else {
      menuItems.push(
        <MenuItem key='delete_all' onClick={this.handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText inset primary='Delete Account' />
        </MenuItem>
      )
    }

    return menuItems
  }

  render () {
    const { isOpen, anchor } = this.props
    const { mailbox, service, rendering } = this.state
    if (!mailbox || !service || !rendering) { return false }

    return (
      <Menu
        open={isOpen}
        anchorEl={anchor}
        MenuListProps={{ dense: true }}
        disableEnforceFocus
        onClose={this.handlePopoverClose}>
        {this.renderMenuItems()}
      </Menu>
    )
  }
}
