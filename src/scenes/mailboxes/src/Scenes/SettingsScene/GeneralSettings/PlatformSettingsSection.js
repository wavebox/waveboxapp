import PropTypes from 'prop-types'
import React from 'react'
import platformActions from 'stores/platform/platformActions'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from 'material-ui/styles'
import green from 'material-ui/colors/green'
import { Button, Menu, MenuItem } from 'material-ui'
import CheckIcon from '@material-ui/icons/Check'

const styles = {
  beenSetIcon: {
    marginRight: 6,
    height: 18,
    width: 18,
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
      <SettingsListSection title='Platform' {...passProps}>
        {mailtoLinkHandlerSupported ? (
          <SettingsListSwitch
            label='Handle mailto links'
            onChange={(evt, toggled) => platformActions.changeMailtoLinkHandler(toggled)}
            checked={isMailtoLinkHandler} />
        ) : undefined}
        {openAtLoginSupported ? (
          <SettingsListItem divider={false}>
            <Button
              size='small'
              variant='raised'
              onClick={(evt) => this.setState({ openLoginPopoverAnchor: evt.target })}>
              {openLoginHasBeenSet ? <CheckIcon className={classes.beenSetIcon} /> : undefined}
              {openLoginHasBeenSet ? 'All Set' : 'System Startup Settings'}
            </Button>
            <Menu
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
          </SettingsListItem>
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default PlatformSettingsSection
