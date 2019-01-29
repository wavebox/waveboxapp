import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@material-ui/core'
import FABLinuxIcon from 'wbfa/FABLinux'
import FABAppleIcon from 'wbfa/FABApple'
import FABWindowsIcon from 'wbfa/FABWindows'

class ULinkORDialogPrimarySection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onOpenInWaveboxWindow: PropTypes.func.isRequired,
    onOpenInSystemBrowser: PropTypes.func.isRequired,
    iconResolver: PropTypes.func.isRequired
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
      iconResolver
    } = this.props

    const OSIconComponent = this.getOSIconComponent()

    return (
      <React.Fragment>
        <ListItem button onClick={onOpenInWaveboxWindow}>
          <ListItemAvatar>
            <Avatar src={iconResolver('app.svg')} />
          </ListItemAvatar>
          <ListItemText
            primary={(<strong>Wavebox Window</strong>)}
            secondary='Use your current session & stay logged in' />
        </ListItem>
        <ListItem button onClick={onOpenInSystemBrowser}>
          <ListItemAvatar>
            <Avatar>
              <OSIconComponent />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={(<strong>Default Browser</strong>)}
            secondary='Use the default browser on your machine' />
        </ListItem>
        <Divider />
      </React.Fragment>
    )
  }
}

export default ULinkORDialogPrimarySection
