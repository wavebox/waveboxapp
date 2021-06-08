import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import ServiceAdvancedSection from '../Common/ServiceAdvancedSection'
import { accountStore, accountActions } from 'stores/account'
import { userActions } from 'stores/user'
import SettingsListSection from 'wbui/SettingsListSection'
import ContainerServiceReducer from 'shared/AltStores/Account/ServiceReducers/ContainerServiceReducer'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemText from 'wbui/SettingsListItemText'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import CodeIcon from '@material-ui/icons/Code'
import RefreshIcon from '@material-ui/icons/Refresh'
import CheckIcon from '@material-ui/icons/Check'
import FolderOpenIcon from '@material-ui/icons/FolderOpen'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListTypography from 'wbui/SettingsListTypography'
import ConfirmButton from 'wbui/ConfirmButton'
import { Button, ListItemText } from '@material-ui/core'
import { ipcRenderer } from 'electron'
import { WB_GUEST_API_OPEN_CONTAINER_FOLDER } from 'shared/ipcEvents'
import { SERVICE_API_WEB_URL } from 'shared/constants'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  reloadApiButton: {
    marginRight: 6
  },
  iconWrap: {
    display: 'inline-block',
    marginRight: 6,
    '&>*': {
      width: 18,
      height: 18,
      verticalAlign: 'text-bottom'
    }
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[600]
  }
}

@withStyles(styles)
class ContainerServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
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
      this.setState({
        ...this.extractStateForService(nextProps.serviceId, accountStore.getState())
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      urlError: null,
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
      restoreLastUrl: service.restoreLastUrl,
      containerId: service.container.id,
      containerVersion: service.container.version,
      hasSAPIConfig: service.hasSAPIConfig
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the service api docs
  * @param evt: the event that fired
  */
  handleOpenServiceAPIDocs = (evt) => {
    WBRPCRenderer.wavebox.openExternal(SERVICE_API_WEB_URL)
  }

  /**
  * Reloads all the api integrations
  * @param evt: the event that fired
  */
  handleReloadServiceAPIIntegrations = (evt) => {
    userActions.reloadContainerSAPI()
    accountActions.containerSAPIUpdated()
  }

  /**
  * Opens the directory for this container
  * @param evt: the event that fired
  */
  handleOpenServiceAPIDirectory = (evt) => {
    ipcRenderer.send(WB_GUEST_API_OPEN_CONTAINER_FOLDER, this.state.containerId)
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
      showRestart,
      onRequestEditCustomCode,
      classes,
      ...passProps
    } = this.props
    const {
      hasService,
      restoreLastUrl,
      containerId,
      containerVersion,
      hasSAPIConfig
    } = this.state
    if (!hasService) { return false }

    return (
      <div {...passProps}>
        <SettingsListSection
          icon={<AccountCircleIcon />}
          title='Account'>
          <SettingsListItemSwitch
            divider={false}
            label='Restore last page on load'
            checked={restoreLastUrl}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ContainerServiceReducer.setRestoreLastUrl, toggled)
            }} />
        </SettingsListSection>
        <ServiceAppearanceSection serviceId={serviceId} />
        <ServiceBadgeSection serviceId={serviceId} />
        <ServiceBehaviourSection serviceId={serviceId} />
        <ServiceNotificationSection serviceId={serviceId} />
        <ServiceAdvancedSection serviceId={serviceId} onRequestEditCustomCode={onRequestEditCustomCode} />
        <SettingsListSection title='Service Api' icon={<CodeIcon />}>
          <SettingsListItem>
            <ListItemText primary={(
              <SettingsListTypography>
                {hasSAPIConfig ? 'Api loaded' : 'No api loaded'}
              </SettingsListTypography>
            )} />
            <div>
              <ConfirmButton
                size='small'
                variant='contained'
                className={classes.reloadApiButton}
                content={(
                  <span>
                    <span className={classes.iconWrap}><RefreshIcon /></span>
                    Reload
                  </span>
                )}
                confirmContent={(
                  <span>
                    <span className={classes.iconWrap}><CheckIcon /></span>
                    Reloaded
                  </span>
                )}
                confirmWaitMs={1500}
                onConfirmedClick={this.handleReloadServiceAPIIntegrations}
                onClick={this.handleReloadServiceAPIIntegrations} />
              <Button
                size='small'
                variant='contained'
                onClick={this.handleOpenServiceAPIDirectory}>
                <span>
                  <span className={classes.iconWrap}><FolderOpenIcon /></span>
                  Open directory
                </span>
              </Button>
            </div>
          </SettingsListItem>
          <SettingsListItemText
            divider={false}
            primary={(
              <span className={classes.link} onClick={this.handleOpenServiceAPIDocs}>Find out more about the Service API</span>
            )} />
        </SettingsListSection>
        <SettingsListSection title='About' icon={<HelpOutlineIcon />}>
          <SettingsListItemText primary='Container ID' secondary={containerId} />
          <SettingsListItemText
            divider={false}
            primary='Container Version'
            secondary={`${containerVersion}${hasSAPIConfig ? '+Service API' : ''}`} />
        </SettingsListSection>
      </div>
    )
  }
}

export default ContainerServiceSettings
