import PropTypes from 'prop-types'
import React from 'react'
import { Popover, Menu, MenuItem, Divider, FontIcon } from 'material-ui'
import { mailboxActions, mailboxDispatch } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

export default class SidelistItemMailboxPopover extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    serviceType: PropTypes.string,
    isFirst: PropTypes.bool.isRequired,
    isLast: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    onRequestClose: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evtOrFn: the fired event or a function to call on closed
  */
  handleClosePopover = (evtOrFn) => {
    this.props.onRequestClose()
    if (typeof (evtOrFn) === 'function') {
      setTimeout(() => { evtOrFn() }, 200)
    }
  }

  /**
  * Deletes this mailbox
  */
  handleDelete = () => {
    this.handleClosePopover(() => {
      mailboxActions.remove(this.props.mailbox.id)
    })
  }

  /**
  * Opens the inspector window for this mailbox
  */
  handleInspect = () => {
    mailboxDispatch.openDevTools(this.props.mailbox.id, this.props.serviceType)
    this.handleClosePopover()
  }

  /**
  * Reloads this mailbox
  */
  handleReload = () => {
    mailboxDispatch.reload(this.props.mailbox.id, this.props.serviceType)
    this.handleClosePopover()
  }

  /**
  * Re-syncs the mailbox
  */
  handleResync = () => {
    mailboxActions.fullSyncMailbox(this.props.mailbox.id)
    this.handleClosePopover()
  }

  /**
  * Moves this item up
  */
  handleMoveUp = () => {
    this.handleClosePopover(() => {
      mailboxActions.moveUp(this.props.mailbox.id)
    })
  }

  /**
  * Moves this item down
  */
  handleMoveDown = () => {
    this.handleClosePopover(() => {
      mailboxActions.moveDown(this.props.mailbox.id)
    })
  }

  /**
  * Handles the user requesting an account reauthentication
  */
  handeReauthenticateBrowserSession = () => {
    mailboxActions.reauthenticateBrowserSession(this.props.mailbox.id, this.props.mailbox.partition)
    this.handleClosePopover()
  }

  /**
  * Handles opening the account settings
  */
  handleAccountSettings = () => {
    this.handleClosePopover(() => {
      window.location.hash = `settings/accounts/${this.props.mailbox.id}`
    })
  }

  /**
  * Handles reauthenticting the mailbox
  */
  handleReauthenticate = () => {
    mailboxActions.reauthenticateMailbox(this.props.mailbox.id)
    this.handleClosePopover()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the menu items
  * @param mailbox: the mailbox to render for
  * @param isFirst: true if this is the first item
  * @Param isLast: true if this is the last item
  * @return array of jsx elements
  */
  renderMenuItems (mailbox, isFirst, isLast) {
    const menuItems = [
      // Mailbox Info
      mailbox.displayName ? (
        <MenuItem
          key='info'
          primaryText={mailbox.displayName}
          disabled />) : undefined,

      // Error handling
      mailbox.isAuthenticationInvalid ? (
        <MenuItem
          key='reauthenticate'
          primaryText='Reauthenticate'
          onClick={this.handleReauthenticate}
          style={{ color: Colors.red600 }}
          leftIcon={<FontIcon className='material-icons' style={{ color: Colors.red600 }}>error_outline</FontIcon>} />
      ) : undefined,
      mailbox.isAuthenticationInvalid ? (
        <Divider key='div-errors' />
      ) : undefined,

      // Ordering controls
      isFirst ? undefined : (
        <MenuItem
          key='moveup'
          primaryText='Move Up'
          onClick={this.handleMoveUp}
          leftIcon={<FontIcon className='material-icons'>arrow_upward</FontIcon>} />),
      isLast ? undefined : (
        <MenuItem
          key='movedown'
          primaryText='Move Down'
          onClick={this.handleMoveDown}
          leftIcon={<FontIcon className='material-icons'>arrow_downward</FontIcon>} />),
      isFirst && isLast ? undefined : (<Divider key='div-ordering' />),

      // Account Actions
      (<MenuItem
        key='delete'
        primaryText='Delete'
        onClick={this.handleDelete}
        leftIcon={<FontIcon className='material-icons'>delete</FontIcon>} />),
      (<MenuItem
        key='settings'
        primaryText='Account Settings'
        onClick={this.handleAccountSettings}
        leftIcon={<FontIcon className='material-icons'>settings</FontIcon>} />),
      !mailbox.artificiallyPersistCookies ? undefined : (
        <MenuItem
          key='reauthenticate'
          primaryText='Re-Authenticate'
          onClick={this.handeReauthenticateBrowserSession}
          leftIcon={<FontIcon className='material-icons'>lock_outline</FontIcon>} />),
      (<Divider key='div-actions' />),

      // Advanced Actions
      (<MenuItem
        key='reload'
        primaryText='Reload'
        onClick={this.handleReload}
        leftIcon={<FontIcon className='material-icons'>refresh</FontIcon>} />),
      (<MenuItem
        key='sync'
        primaryText='Resync'
        onClick={this.handleResync}
        leftIcon={<FontIcon className='material-icons'>sync</FontIcon>} />),
      (<MenuItem
        key='inspect'
        primaryText='Inspect'
        onClick={this.handleInspect}
        leftIcon={<FontIcon className='material-icons'>bug_report</FontIcon>} />)
    ].filter((item) => !!item)

    return menuItems
  }

  render () {
    const { mailbox, isFirst, isLast, isOpen, anchor } = this.props

    return (
      <Popover
        open={isOpen}
        anchorEl={anchor}
        anchorOrigin={{ horizontal: 'middle', vertical: 'center' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={this.handleClosePopover}>
        <Menu desktop onEscKeyDown={this.handleClosePopover}>
          {this.renderMenuItems(mailbox, isFirst, isLast)}
        </Menu>
      </Popover>
    )
  }
}
