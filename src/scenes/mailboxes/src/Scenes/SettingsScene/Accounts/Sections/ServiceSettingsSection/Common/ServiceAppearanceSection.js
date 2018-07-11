import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import AdjustIcon from '@material-ui/icons/Adjust'
import shallowCompare from 'react-addons-shallow-compare'
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import AccountAvatarProcessor from 'shared/AltStores/Account/AccountAvatarProcessor'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import ColorLensIcon from '@material-ui/icons/ColorLens'
import SettingsListItemColorPicker from 'wbui/SettingsListItemColorPicker'
import SettingsListItemAvatarPicker from 'wbui/SettingsListItemAvatarPicker'

const styles = {

}

@withStyles(styles)
class ServiceAppearanceSection extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    beforeDisplayName: PropTypes.func,
    displayNameDisabled: PropTypes.bool.isRequired,
    displayNameAvailable: PropTypes.bool.isRequired,
    afterDisplayName: PropTypes.func,
    beforeColor: PropTypes.func,
    colorDisabled: PropTypes.bool.isRequired,
    colorAvailable: PropTypes.bool.isRequired,
    afterColor: PropTypes.func,
    beforeAvatar: PropTypes.func,
    avatarDisabled: PropTypes.bool.isRequired,
    avatarAvailable: PropTypes.bool.isRequired,
    afterAvatar: PropTypes.func
  }

  static defaultProps = {
    displayNameDisabled: false,
    displayNameAvailable: true,
    colorDisabled: false,
    colorAvailable: true,
    avatarDisabled: false,
    avatarAvailable: true
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.extractStateForService(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      displayName: service.displayName,
      serviceColor: service.color,
      serviceAvatar: accountState.getAvatar(service.avatarId)
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      classes,
      beforeDisplayName,
      displayNameDisabled,
      displayNameAvailable,
      afterDisplayName,
      beforeColor,
      colorDisabled,
      colorAvailable,
      afterColor,
      beforeAvatar,
      avatarDisabled,
      avatarAvailable,
      afterAvatar,
      ...passProps
    } = this.props
    const {
      hasService,
      displayName,
      serviceColor,
      serviceAvatar
    } = this.state
    if (!hasService) { return false }

    const items = [
      beforeDisplayName,
      displayNameAvailable ? (isLast) => {
        return (
          <SettingsListItemTextField
            divider={!isLast}
            key={`displayName_${displayName}`}
            label='Display Name'
            textFieldProps={{
              disabled: displayNameDisabled,
              defaultValue: displayName,
              placeholder: 'My Service',
              onBlur: (evt) => {
                accountActions.reduceService(serviceId, ServiceReducer.setDisplayName, evt.target.value)
              }
            }} />
        )
      } : undefined,
      afterDisplayName,
      beforeColor,
      colorAvailable ? (isLast) => {
        return (
          <SettingsListItemColorPicker
            key='color'
            divider={!isLast}
            disabled={colorDisabled}
            labelText='Account Color'
            IconClass={ColorLensIcon}
            value={serviceColor}
            onChange={(col) => accountActions.reduceService(serviceId, ServiceReducer.setColor, col)}
            showClear
            ClearIconClass={NotInterestedIcon}
            clearLabelText='Clear color'
          />
        )
      } : undefined,
      afterColor,
      beforeAvatar,
      avatarAvailable ? (isLast) => {
        return (
          <SettingsListItemAvatarPicker
            key='avatar'
            divider={!isLast}
            label='Change Account Icon'
            disabled={avatarDisabled}
            icon={<InsertEmoticonIcon />}
            preview={serviceAvatar}
            onChange={(evt) => {
              AccountAvatarProcessor.processAvatarFileUpload(evt, (av) => {
                accountActions.setCustomAvatarOnService(serviceId, av)
              })
            }}
            onClear={() => accountActions.setCustomAvatarOnService(serviceId, undefined)}
            clearLabel='Reset Account Icon'
            clearIcon={<NotInterestedIcon />} />
        )
      } : undefined,
      afterAvatar
    ].filter((item) => !!item).map((item, index, arr) => {
      return item(index === (arr.length - 1))
    })
    if (!items.length) { return false }

    return (
      <SettingsListSection title='Appearance' icon={<AdjustIcon />} {...passProps}>
        {items}
      </SettingsListSection>
    )
  }
}

export default ServiceAppearanceSection
