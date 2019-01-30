import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItemText, ListItemAvatar, Avatar, Divider } from '@material-ui/core'
import FABLinuxIcon from 'wbfa/FABLinux'
import FABAppleIcon from 'wbfa/FABApple'
import FABWindowsIcon from 'wbfa/FABWindows'
import ULinkORListItem from './ULinkORListItem'

class ULinkORDialogPrimarySection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onOpenInWaveboxWindow: PropTypes.func.isRequired,
    onOpenInSystemBrowser: PropTypes.func.isRequired,
    iconResolver: PropTypes.func.isRequired,
    onItemKeyDown: PropTypes.func
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
      onItemKeyDown
    } = this.props

    const OSIconComponent = this.getOSIconComponent()

    return (
      <React.Fragment>
        <ULinkORListItem onClick={onOpenInWaveboxWindow} onKeyDown={onItemKeyDown}>
          <ListItemAvatar>
            <Avatar src={iconResolver('app.svg')} />
          </ListItemAvatar>
          <ListItemText
            primary={(<strong>Wavebox Window</strong>)}
            secondary='Use your current session & stay logged in' />
        </ULinkORListItem>
        <ULinkORListItem onClick={onOpenInSystemBrowser} onKeyDown={onItemKeyDown}>
          <ListItemAvatar>
            <Avatar>
              <OSIconComponent />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={(<strong>Default Browser</strong>)}
            secondary='Use the default browser on your machine' />
        </ULinkORListItem>
        <Divider />
      </React.Fragment>
    )
  }
}

export default ULinkORDialogPrimarySection
