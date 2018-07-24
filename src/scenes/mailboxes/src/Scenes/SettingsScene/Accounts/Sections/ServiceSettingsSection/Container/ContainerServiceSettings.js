import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import ServiceAdvancedSection from '../Common/ServiceAdvancedSection'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import ContainerServiceReducer from 'shared/AltStores/Account/ServiceReducers/ContainerServiceReducer'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemText from 'wbui/SettingsListItemText'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

export default class ContainerServiceSettings extends React.Component {
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
      hasNavigationToolbar: service.hasNavigationToolbar,
      containerId: service.container.id,
      containerVersion: service.container.version
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
    const { serviceId, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const {
      hasService,
      restoreLastUrl,
      hasNavigationToolbar,
      containerId,
      containerVersion
    } = this.state
    if (!hasService) { return false }

    return (
      <div {...passProps}>
        <SettingsListSection
          icon={<AccountCircleIcon />}
          title='Account'>
          <SettingsListItemSwitch
            label='Show navigation toolbar'
            checked={hasNavigationToolbar}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, ContainerServiceReducer.setHasNavigationToolbar, toggled)
            }} />
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
        <SettingsListSection
          title='About'
          icon={<HelpOutlineIcon />}>
          <SettingsListItemText primary='Container ID' secondary={containerId} />
          <SettingsListItemText divider={false} primary='Container Version' secondary={containerVersion} />
        </SettingsListSection>
      </div>
    )
  }
}
