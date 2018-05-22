import PropTypes from 'prop-types'
import React from 'react'
import platformActions from 'stores/platform/platformActions'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import { withStyles } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'
import { Menu, MenuItem } from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import ComputerIcon from '@material-ui/icons/Computer'
import SettingsListItemButton from 'wbui/SettingsListItemButton'

const styles = {
  beenSetIcon: {
    color: green[600]
  }
}

@withStyles(styles)
class PlatformSettingsSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  static propTypes = {
    mailtoLinkHandlerSupported: PropTypes.bool.isRequired,
    isMailtoLinkHandler: PropTypes.bool.isRequired,
    openAtLoginSupported: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.openLoginHasBeenSetTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.openLoginHasBeenSetTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      openLoginPopoverAnchor: null,
      openLoginHasBeenSet: false
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the open at login state chaning
  * @param evt: the event that fired
  * @param openAtLogin: true to open at login
  * @param openAsHidden: true to open as hidden
  */
  handleOpenAtLoginChanged = (evt, openAtLogin, openAsHidden) => {
    platformActions.changeLoginPref(openAtLogin, openAsHidden)
    this.setState({ openLoginPopoverAnchor: null })

    clearTimeout(this.openLoginHasBeenSetTO)
    this.openLoginHasBeenSetTO = setTimeout(() => {
      this.setState({ openLoginHasBeenSet: true })
      clearTimeout(this.openLoginHasBeenSetTO)
      this.openLoginHasBeenSetTO = setTimeout(() => {
        this.setState({ openLoginHasBeenSet: false })
      }, 1500)
    }, 100)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailtoLinkHandlerSupported,
      isMailtoLinkHandler,
      openAtLoginSupported,
      classes,
      ...passProps
    } = this.props
    const {
      openLoginPopoverAnchor,
      openLoginHasBeenSet
    } = this.state

    if (!mailtoLinkHandlerSupported && !openAtLoginSupported) { return null }

    return (
      <SettingsListSection title='Platform' icon={<ComputerIcon />} {...passProps}>
        {mailtoLinkHandlerSupported ? (
          <SettingsListItemSwitch
            label='Handle mailto links'
            onChange={(evt, toggled) => platformActions.changeMailtoLinkHandler(toggled)}
            checked={isMailtoLinkHandler} />
        ) : undefined}
        {openAtLoginSupported ? (
          <SettingsListItemButton
            divider={false}
            label={openLoginHasBeenSet ? 'All Set' : 'System Startup Settings'}
            icon={openLoginHasBeenSet ? <CheckIcon className={classes.beenSetIcon} /> : undefined}
            onClick={(evt) => this.setState({ openLoginPopoverAnchor: evt.target })}>
            <Menu
              disableEnforceFocus
              anchorEl={openLoginPopoverAnchor}
              open={!!openLoginPopoverAnchor}
              onClose={() => this.setState({ openLoginPopoverAnchor: null })}>
              <MenuItem onClick={(evt) => this.handleOpenAtLoginChanged(evt, false, false)}>
                Don't open at System Startup
              </MenuItem>
              <MenuItem onClick={(evt) => this.handleOpenAtLoginChanged(evt, true, false)}>
                Open at System Startup
              </MenuItem>
              <MenuItem onClick={(evt) => this.handleOpenAtLoginChanged(evt, true, true)}>
                Open hidden at System Startup
              </MenuItem>
            </Menu>
          </SettingsListItemButton>
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default PlatformSettingsSection
