import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, RaisedButton, Popover, Menu, MenuItem, FontIcon } from 'material-ui'
import platformActions from 'stores/platform/platformActions'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'

export default class PlatformSettingsSection extends React.Component {
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
      openLoginPopoverOpen: false,
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
  handleOpenAtLoginChanged (evt, openAtLogin, openAsHidden) {
    platformActions.changeLoginPref(openAtLogin, openAsHidden)
    this.setState({ openLoginPopoverOpen: false })

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
      ...passProps
    } = this.props
    const {
      openLoginPopoverOpen,
      openLoginPopoverAnchor,
      openLoginHasBeenSet
    } = this.state

    if (!mailtoLinkHandlerSupported && !openAtLoginSupported) { return null }

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Platform</h1>
        {mailtoLinkHandlerSupported ? (
          <Toggle
            toggled={isMailtoLinkHandler}
            labelPosition='right'
            label='Handle mailto links'
            onToggle={(evt, toggled) => platformActions.changeMailtoLinkHandler(toggled)} />
        ) : undefined}
        {openAtLoginSupported ? (
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <RaisedButton
              onTouchTap={(evt) => this.setState({ openLoginPopoverOpen: true, openLoginPopoverAnchor: evt.target })}
              icon={openLoginHasBeenSet ? (<FontIcon className='material-icons' color={Colors.green600}>check</FontIcon>) : undefined}
              label={openLoginHasBeenSet ? 'All Set' : 'System Startup Settings'} />
            <Popover
              open={openLoginPopoverOpen}
              anchorEl={openLoginPopoverAnchor}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={() => this.setState({ openLoginPopoverOpen: false })}>
              <Menu>
                <MenuItem
                  onTouchTap={(evt) => this.handleOpenAtLoginChanged(evt, false, false)}
                  primaryText={`Don't open at System Startup`} />
                <MenuItem
                  onTouchTap={(evt) => this.handleOpenAtLoginChanged(evt, true, false)}
                  primaryText={'Open at System Startup'} />
                <MenuItem
                  onTouchTap={(evt) => this.handleOpenAtLoginChanged(evt, true, true)}
                  primaryText={'Open hidden at System Startup'} />
              </Menu>
            </Popover>
          </div>
        ) : undefined}
      </Paper>
    )
  }
}
