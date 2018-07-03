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

const styles = {
  buttonIcon: {
    marginRight: 6,
    width: 18,
    height: 18
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
    serviceId: PropTypes.string.isRequired
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
      displayName: service.displayName
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
      ...passProps
    } = this.props
    const {
      hasService,
      displayName
    } = this.state
    if (!hasService) { return false }

    const items = [
      (isLast) => {
        return (
          <SettingsListItemTextField
            divider={!isLast}
            key={`displayName_${displayName}`}
            label='Account Name'
            textFieldProps={{
              defaultValue: displayName,
              placeholder: 'My Account',
              onBlur: (evt) => {
                accountActions.reduceService(serviceId, ServiceReducer.setDisplayName, evt.target.value)
              }
            }} />
        )
      },
      (isLast) => {
        return (
          <SettingsListItem
            key='avatar'
            divider={!isLast}>
            <FileUploadButton
              size='small'
              variant='raised'
              accept='image/*'
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
              onClick={() => accountActions.setCustomAvatarOnService(serviceId, undefined)}>
              <NotInterestedIcon className={classes.buttonIcon} />
              Reset Account Icon
            </Button>
          </SettingsListItem>
        )
      }
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
