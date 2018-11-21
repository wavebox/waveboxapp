import PropTypes from 'prop-types'
import React from 'react'
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider, Tooltip, IconButton } from '@material-ui/core'
import { settingsStore, settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp'
import UISettings from 'shared/Models/Settings/UISettings'
import FASRulerVerticalIcon from 'wbfa/FASRulerVertical'
import FARRulerVerticalIcon from 'wbfa/FARRulerVertical'
import FALRulerVerticalIcon from 'wbfa/FALRulerVertical'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  faIconWrapper: {
    width: 24,
    height: 24,
    fontSize: 24
  },
  sidebarSizeLeftIcon: {
    marginLeft: 6
  }
}

@withStyles(styles)
class ToolbarContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    anchorPosition: PropTypes.shape({
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired
    }),
    onRequestClose: PropTypes.func.isRequired,
    location: PropTypes.oneOf(['sidebar', 'toolbar']).isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      lockSidebarsAndToolbars: settingsState.ui.lockSidebarsAndToolbars,
      sidebarSize: settingsState.ui.sidebarSize
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      lockSidebarsAndToolbars: settingsState.ui.lockSidebarsAndToolbars,
      sidebarSize: settingsState.ui.sidebarSize
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

  handleToggleBarLock = (evt) => {
    const { lockSidebarsAndToolbars } = this.state
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setLockSidebarsAndToolbars(!lockSidebarsAndToolbars)
    })
  }

  handleOpenSettings = (evt) => {
    this.closePopover(evt, () => {
      window.location.hash = `/settings`
    })
  }

  handleMakeSidebarSizeRegular = (evt) => {
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setSidebarSize(UISettings.SIDEBAR_SIZES.REGULAR)
    })
  }

  handleMakeSidebarSizeCompact = (evt) => {
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setSidebarSize(UISettings.SIDEBAR_SIZES.COMPACT)
    })
  }

  handleMakeSidebarSizeTiny = (evt) => {
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setSidebarSize(UISettings.SIDEBAR_SIZES.TINY)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
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

  /**
  * Renders the sidelist icon
  * @param size: the size to render for
  * @param className: classname to apply
  * @return jsx
  */
  renderSidelistIcon (size, className) {
    switch (size) {
      case UISettings.SIDEBAR_SIZES.REGULAR: return (<FASRulerVerticalIcon className={className} />)
      case UISettings.SIDEBAR_SIZES.COMPACT: return (<FARRulerVerticalIcon className={className} />)
      case UISettings.SIDEBAR_SIZES.TINY: return (<FALRulerVerticalIcon className={className} />)
    }
  }

  render () {
    const {
      isOpen,
      anchor,
      anchorPosition,
      location,
      classes
    } = this.props
    const {
      lockSidebarsAndToolbars,
      sidebarSize
    } = this.state

    return (
      <Menu
        open={isOpen}
        anchorEl={anchor}
        anchorPosition={anchorPosition}
        anchorReference='anchorPosition'
        MenuListProps={{ dense: true }}
        disableEnforceFocus
        onClose={this.closePopover}>
        <MenuItem onClick={this.handleToggleBarLock}>
          <ListItemIcon>
            {lockSidebarsAndToolbars ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
          </ListItemIcon>
          <ListItemText inset primary={`${lockSidebarsAndToolbars ? 'Unlock' : 'Lock'} sidebar & toolbars`} />
        </MenuItem>
        {location === 'sidebar' ? (
          <MenuItem>
            <ListItemIcon>
              <span className={classes.faIconWrapper}>
                {this.renderSidelistIcon(sidebarSize, classes.sidebarSizeLeftIcon)}
              </span>
            </ListItemIcon>
            <ListItemText inset primary='Change sidebar size' />
            {sidebarSize !== UISettings.SIDEBAR_SIZES.REGULAR ? (
              <Tooltip title='Regular'>
                <IconButton onClick={this.handleMakeSidebarSizeRegular}>
                  {this.renderSidelistIcon(UISettings.SIDEBAR_SIZES.REGULAR)}
                </IconButton>
              </Tooltip>
            ) : undefined}
            {sidebarSize !== UISettings.SIDEBAR_SIZES.COMPACT ? (
              <Tooltip title='Compact'>
                <IconButton onClick={this.handleMakeSidebarSizeCompact}>
                  {this.renderSidelistIcon(UISettings.SIDEBAR_SIZES.COMPACT)}
                </IconButton>
              </Tooltip>
            ) : undefined}
            {sidebarSize !== UISettings.SIDEBAR_SIZES.TINY ? (
              <Tooltip title='Tiny'>
                <IconButton onClick={this.handleMakeSidebarSizeTiny}>
                  {this.renderSidelistIcon(UISettings.SIDEBAR_SIZES.TINY)}
                </IconButton>
              </Tooltip>
            ) : undefined}
          </MenuItem>
        ) : undefined}
        <Divider />
        <MenuItem onClick={this.handleOpenSettings}>
          <ListItemIcon><SettingsSharpIcon /></ListItemIcon>
          <ListItemText inset primary='Settings' />
        </MenuItem>
      </Menu>
    )
  }
}

export default ToolbarContextMenu
