import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import AdjustIcon from '@material-ui/icons/Adjust'
import shallowCompare from 'react-addons-shallow-compare'
import InsertEmoticonButton from '@material-ui/icons/InsertEmoticon'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import { Button } from '@material-ui/core'
import FileUploadButton from 'wbui/FileUploadButton'
import AccountAvatarProcessor from 'shared/AltStores/Account/AccountAvatarProcessor'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import ColorPickerButton from 'wbui/ColorPickerButton'
import ColorLensIcon from '@material-ui/icons/ColorLens'

const styles = {
  buttonIcon: {
    marginRight: 6,
    width: 18,
    height: 18
  },
  buttonColorPreview: {
    overflow: 'hidden'
  },
  buttonIconColorPreview: {
    marginTop: -9,
    marginRight: 6,
    marginBottom: -9,
    marginLeft: -9,
    padding: 7,
    width: 32,
    height: 34,
    verticalAlign: 'middle'
  },
  buttonSpacer: {
    width: 16,
    height: 1,
    display: 'inline-block'
  }
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
      serviceColor: service.color
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
      serviceColor
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
          <SettingsListItem
            key='color'
            divider={!isLast}>
            <ColorPickerButton
              disabled={colorDisabled}
              buttonProps={{
                variant: 'raised',
                size: 'small',
                className: classes.buttonColorPreview
              }}
              value={serviceColor}
              onChange={(col) => accountActions.reduceService(serviceId, ServiceReducer.setColor, col)}>
              <ColorLensIcon
                className={classes.buttonIconColorPreview}
                style={ColorPickerButton.generatePreviewIconColors(serviceColor)} />
              Account Color
            </ColorPickerButton>
            <span className={classes.buttonSpacer} />
            <Button
              variant='raised'
              size='small'
              disabled={colorDisabled}
              onClick={() => accountActions.reduceService(serviceId, ServiceReducer.setColor, undefined)}>
              <NotInterestedIcon className={classes.buttonIcon} />
              Clear Color
            </Button>
          </SettingsListItem>
        )
      } : undefined,
      afterColor,
      beforeAvatar,
      avatarAvailable ? (isLast) => {
        return (
          <SettingsListItem
            key='avatar'
            divider={!isLast}>
            <FileUploadButton
              size='small'
              variant='raised'
              accept='image/*'
              disabled={avatarDisabled}
              onChange={(evt) => {
                AccountAvatarProcessor.processAvatarFileUpload(evt, (av) => {
                  accountActions.setCustomAvatarOnService(serviceId, av)
                })
              }}>
              <InsertEmoticonButton className={classes.buttonIcon} />
              Change Account Icon
            </FileUploadButton>
            <span className={classes.buttonSpacer} />
            <Button
              size='small'
              variant='raised'
              disabled={avatarDisabled}
              onClick={() => accountActions.setCustomAvatarOnService(serviceId, undefined)}>
              <NotInterestedIcon className={classes.buttonIcon} />
              Reset Account Icon
            </Button>
          </SettingsListItem>
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
