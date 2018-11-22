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
import FARQuestionCircleIcon from 'wbfa/FARQuestionCircle'
import FARStarIcon from 'wbfa/FARStar'

const styles = {
  faIconWrapper: {
    width: 20,
    height: 20,
    fontSize: 20
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
    return {
      ...this.deriveSettingState(settingsStore.getState())
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState(this.deriveSettingState(settingsStore.getState()))
  }

  deriveSettingState (settingsState) {
    return {
      lockSidebarsAndToolbars: settingsState.ui.lockSidebarsAndToolbars,
      sidebarSize: settingsState.ui.sidebarSize,
      showSidebarSupport: settingsState.ui.showSidebarSupport,
      showSidebarNewsfeed: settingsState.ui.showSidebarNewsfeed
    }
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

  handleShowSidebarNews = (evt) => {
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.ALWAYS)
    })
  }

  handleShowSidebarSupport = (evt) => {
    this.closePopover(evt, () => {
      settingsActions.sub.ui.setShowSidebarSupport(true)
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
  renderSidelistSizeIcon (size, className) {
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
      sidebarSize,
      showSidebarSupport,
      showSidebarNewsfeed
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
                {this.renderSidelistSizeIcon(sidebarSize, classes.sidebarSizeLeftIcon)}
              </span>
            </ListItemIcon>
            <ListItemText inset primary='Change sidebar size' />
            {sidebarSize !== UISettings.SIDEBAR_SIZES.REGULAR ? (
              <Tooltip title='Regular'>
                <IconButton onClick={this.handleMakeSidebarSizeRegular}>
                  {this.renderSidelistSizeIcon(UISettings.SIDEBAR_SIZES.REGULAR)}
                </IconButton>
              </Tooltip>
            ) : undefined}
            {sidebarSize !== UISettings.SIDEBAR_SIZES.COMPACT ? (
              <Tooltip title='Compact'>
                <IconButton onClick={this.handleMakeSidebarSizeCompact}>
                  {this.renderSidelistSizeIcon(UISettings.SIDEBAR_SIZES.COMPACT)}
                </IconButton>
              </Tooltip>
            ) : undefined}
            {sidebarSize !== UISettings.SIDEBAR_SIZES.TINY ? (
              <Tooltip title='Tiny'>
                <IconButton onClick={this.handleMakeSidebarSizeTiny}>
                  {this.renderSidelistSizeIcon(UISettings.SIDEBAR_SIZES.TINY)}
                </IconButton>
              </Tooltip>
            ) : undefined}
          </MenuItem>
        ) : undefined}
        {location === 'sidebar' && (!showSidebarSupport || showSidebarNewsfeed !== UISettings.SIDEBAR_NEWS_MODES.ALWAYS) ? (<Divider />) : undefined}
        {location === 'sidebar' && !showSidebarSupport ? (
          <MenuItem onClick={this.handleShowSidebarSupport}>
            <ListItemIcon>
              <span className={classes.faIconWrapper}>
                <FARQuestionCircleIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Show Help, Support & FAQ`} />
          </MenuItem>
        ) : undefined}
        {location === 'sidebar' && showSidebarNewsfeed !== UISettings.SIDEBAR_NEWS_MODES.ALWAYS ? (
          <MenuItem onClick={this.handleShowSidebarNews}>
            <ListItemIcon>
              <span className={classes.faIconWrapper}>
                <FARStarIcon />
              </span>
            </ListItemIcon>
            <ListItemText inset primary={`Always show What's New`} />
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
