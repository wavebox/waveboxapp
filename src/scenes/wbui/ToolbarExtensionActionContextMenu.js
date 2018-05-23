import PropTypes from 'prop-types'
import React from 'react'
import { Menu, MenuItem, Divider, ListItemText, ListItemIcon } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import ExtensionIcon from '@material-ui/icons/Extension'

const ITEM_TYPES = Object.freeze({
  OPTIONS: 'OPTIONS',
  HOMEPAGE: 'HOMEPAGE',
  MANAGE: 'MANAGE'
})

export default class ToolbarExtensionActionContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get ITEM_TYPES () { return ITEM_TYPES }

  static propTypes = {
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    onRequestClose: PropTypes.func.isRequired,

    name: PropTypes.string.isRequired,
    extensionId: PropTypes.string.isRequired,
    tabId: PropTypes.number,
    hasHomepageUrl: PropTypes.bool.isRequired,
    hasOptions: PropTypes.bool.isRequired,
    onItemSelected: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.renderTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.renderTO)
  }

  componentWillReceiveProps (nextProps) {
    // Delayed render
    if (this.props.open !== nextProps.open) {
      if (nextProps.open) {
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

  state = { rendering: this.props.open }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evt: the event that fired
  * @param callback = undefined: executed on close complete
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
  * Opens the extension options
  * @param evt: the event that fired
  */
  handleOpenOptions = (evt) => {
    this.closePopover(evt, () => {
      this.props.onItemSelected(ITEM_TYPES.OPTIONS, this.props.extensionId, this.props.tabId)
    })
  }

  /**
  * Opens the manage extensions page
  * @param evt: the event that fired
  */
  handleManageExtensions = (evt) => {
    this.closePopover(evt, () => {
      this.props.onItemSelected(ITEM_TYPES.MANAGE, this.props.extensionId, this.props.tabId)
    })
  }

  /**
  * Opens the extensions homepage
  * @param evt: the event that fired
  */
  handleOpenHomepage = (evt) => {
    this.closePopover(evt, () => {
      this.props.onItemSelected(ITEM_TYPES.HOMEPAGE, this.props.extensionId, this.props.tabId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { rendering } = this.state
    if (!rendering) { return false }
    const {
      open,
      anchor,
      name,
      hasHomepageUrl,
      hasOptions
    } = this.props

    return (
      <Menu
        open={open}
        anchorEl={anchor}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        MenuListProps={{ dense: true }}
        disableEnforceFocus
        onClose={this.closePopover}>
        {hasHomepageUrl ? (
          <MenuItem onClick={this.handleOpenHomepage}>
            <ListItemText inset primary={name} />
          </MenuItem>
        ) : undefined}
        {hasHomepageUrl ? (
          <Divider />
        ) : undefined}
        {hasOptions ? (
          <MenuItem onClick={this.handleOpenOptions}>
            <ListItemIcon>
              <SettingsApplicationsIcon />
            </ListItemIcon>
            <ListItemText inset primary='Options' />
          </MenuItem>
        ) : undefined}
        {hasOptions ? (
          <Divider />
        ) : undefined}
        <MenuItem onClick={this.handleManageExtensions}>
          <ListItemIcon>
            <ExtensionIcon />
          </ListItemIcon>
          <ListItemText inset primary='Manage Extensions' />
        </MenuItem>
      </Menu>
    )
  }
}
