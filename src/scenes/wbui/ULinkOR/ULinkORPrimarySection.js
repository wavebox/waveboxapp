import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { ListItemAvatar, Avatar, Divider } from '@material-ui/core'
import FABLinuxIcon from 'wbfa/FABLinux'
import FABAppleIcon from 'wbfa/FABApple'
import FABWindowsIcon from 'wbfa/FABWindows'
import FARBolt from 'wbfa/FARBolt'
import ULinkORListItem from './ULinkORListItem'
import ULinkORListItemText from './ULinkORListItemText'

const privSettingsStore = Symbol('privSettingsStore')

class ULinkORDialogPrimarySection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onOpenInWaveboxWindow: PropTypes.func.isRequired,
    onOpenInSystemBrowser: PropTypes.func.isRequired,
    onOpenInCustomLinkProvider: PropTypes.func.isRequired,
    iconResolver: PropTypes.func.isRequired,
    onItemKeyDown: PropTypes.func,
    settingsStore: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this[privSettingsStore] = this.props.settingsStore

    // Generate state
    const settingsState = this[privSettingsStore].getState()
    this.state = {
      customLinkProviders: settingsState.os.customLinkProviders
    }
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this[privSettingsStore].listen(this.settingsChanged)
  }

  componentWillUnmount () {
    this[privSettingsStore].unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.settingsStore !== nextProps.settingsStore) {
      console.warn('Changing props.settingsStore is not supported in ULinkORDialogPrimarySection and will be ignored')
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  settingsChanged = (settingsState) => {
    this.setState({
      customLinkProviders: settingsState.os.customLinkProviders
    })
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
      onItemKeyDown,
      onOpenInCustomLinkProvider
    } = this.props
    const {
      customLinkProviders
    } = this.state

    const OSIconComponent = this.getOSIconComponent()

    return (
      <React.Fragment>
        <ULinkORListItem onClick={onOpenInWaveboxWindow} onKeyDown={onItemKeyDown}>
          <ListItemAvatar>
            <Avatar src={iconResolver('app.svg')} />
          </ListItemAvatar>
          <ULinkORListItemText
            primary={(<strong>Wavebox Window</strong>)}
            secondary='Use your current session & stay logged in' />
        </ULinkORListItem>
        <ULinkORListItem onClick={onOpenInSystemBrowser} onKeyDown={onItemKeyDown}>
          <ListItemAvatar>
            <Avatar>
              <OSIconComponent />
            </Avatar>
          </ListItemAvatar>
          <ULinkORListItemText
            primary={(<strong>Default Browser</strong>)}
            secondary='Use the default browser on your machine' />
        </ULinkORListItem>
        {Object.keys(customLinkProviders).map((id) => {
          return (
            <ULinkORListItem
              key={id}
              onClick={(evt) => onOpenInCustomLinkProvider(evt, id)}
              onKeyDown={onItemKeyDown}>
              <ListItemAvatar>
                <Avatar>
                  <FARBolt />
                </Avatar>
              </ListItemAvatar>
              <ULinkORListItemText
                primary={(<strong>{customLinkProviders[id].name}</strong>)} />
            </ULinkORListItem>
          )
        })}
        <Divider />
      </React.Fragment>
    )
  }
}

export default ULinkORDialogPrimarySection
