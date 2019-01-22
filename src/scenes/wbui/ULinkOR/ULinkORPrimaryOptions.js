import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Checkbox } from '@material-ui/core'
import FABLinuxIcon from 'wbfa/FABLinux'
import FABAppleIcon from 'wbfa/FABApple'
import FABWindowsIcon from 'wbfa/FABWindows'

const styles = {
  rememberListItem: {
    paddingTop: 0,
    paddingBottom: 0
  },
  rememberCheckbox: {
    marginLeft: -4,
    marginRight: -4,
    marginTop: -5,
    marginBottom: -5
  },
  rememberText: {
    fontWeight: 'bold'
  }
}

@withStyles(styles)
class ULinkORDialogPrimaryOptions extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onOpenInWaveboxWindow: PropTypes.func.isRequired,
    onOpenInSystemBrowser: PropTypes.func.isRequired,
    iconResolver: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    remember: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles opening in a wavebox window
  * @param evt: the event that fired
  */
  handleOpenInWaveboxWindow = (evt) => {
    const { onOpenInWaveboxWindow } = this.props
    const { remember } = this.state
    onOpenInWaveboxWindow(evt, remember)
  }

  /**
  * Handles opening in a system browser
  * @param evt: the event that fired
  */
  handleOpenInSystemBrowser = (evt) => {
    const { onOpenInSystemBrowser } = this.props
    const { remember } = this.state
    onOpenInSystemBrowser(evt, remember)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @return an icon component class
  */
  getOSIconComponent () {
    switch (process.platform) {
      case 'linux': return FABLinuxIcon
      case 'win32': return FABWindowsIcon
      case 'darwin': return FABAppleIcon
    }
  }

  render () {
    const {
      onOpenInWaveboxWindow,
      onOpenInSystemBrowser,
      iconResolver,
      classes,
      ...passProps
    } = this.props
    const {
      remember
    } = this.state

    const OSIconComponent = this.getOSIconComponent()

    return (
      <div {...passProps}>
        <List>
          <ListItem button onClick={this.handleOpenInWaveboxWindow}>
            <ListItemAvatar>
              <Avatar src={iconResolver('app.svg')} />
            </ListItemAvatar>
            <ListItemText
              primary='Wavebox Window'
              secondary='Use your current session & stay logged in' />
          </ListItem>
          <ListItem button onClick={this.handleOpenInSystemBrowser}>
            <ListItemAvatar>
              <Avatar>
                <OSIconComponent />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary='Default Browser'
              secondary='Use the default browser on your machine' />
          </ListItem>
          <ListItem
            className={classes.rememberListItem}
            button
            onClick={() => this.setState({ remember: !remember })}>
            <Checkbox
              className={classes.rememberCheckbox}
              checked={remember}
              onChange={(evt, toggled) => this.setState({ remember: toggled })}
              color='primary'
            />
            <ListItemText
              primaryTypographyProps={{
                className: classes.rememberText,
                variant: 'body2'
              }}
              primary='Remember my choice for this account' />
          </ListItem>
        </List>
      </div>
    )
  }
}

export default ULinkORDialogPrimaryOptions
