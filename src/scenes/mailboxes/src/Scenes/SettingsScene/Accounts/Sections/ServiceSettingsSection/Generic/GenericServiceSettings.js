import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import GenericServiceReducer from 'shared/AltStores/Account/ServiceReducers/GenericServiceReducer'
import ServiceDataReducer from 'shared/AltStores/Account/ServiceDataReducers/ServiceDataReducer'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import validUrl from 'valid-url'
import ServiceAdvancedSection from '../Common/ServiceAdvancedSection'

export default class GenericServiceSettings extends React.Component {
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
      usePageTitleAsDisplayName: service.usePageTitleAsDisplayName,
      url: service.url,
      restoreLastUrl: service.restoreLastUrl,
      hasNavigationToolbar: service.hasNavigationToolbar,
      usePageThemeAsColor: service.usePageThemeAsColor,
      supportsWBGAPI: service.supportsWBGAPI
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Handles the url changing
  * @param evt: the event that fired
  */
  handleUrlChange = (evt) => {
    const value = evt.target.value
    if (!value) {
      this.setState({ urlError: 'Service url is required' })
    } else if (!validUrl.isUri(value)) {
      this.setState({ urlError: 'Service url is not a valid url' })
    } else {
      this.setState({ urlError: null })
      accountActions.reduceServiceData(
        this.props.serviceId,
        ServiceDataReducer.clearUrl
      )
      accountActions.reduceService(
        this.props.serviceId,
        GenericServiceReducer.setUrl,
        value
      )
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
      usePageTitleAsDisplayName,
      url,
      urlError,
      restoreLastUrl,
      hasNavigationToolbar,
      usePageThemeAsColor,
      supportsWBGAPI
    } = this.state
    if (!hasService) { return false }

    return (
      <div {...passProps}>
        <SettingsListSection
          icon={<AccountCircleIcon />}
          title='Account'>
          <SettingsListItemTextField
            key={`service_${url}`}
            label='Website Url'
            textFieldProps={{
              type: 'url',
              defaultValue: url,
              placeholder: 'https://wavebox.io',
              error: !!urlError,
              helperText: urlError,
              onBlur: this.handleUrlChange
            }} />
          <SettingsListItemSwitch
            label='Restore last page on load'
            checked={restoreLastUrl}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, GenericServiceReducer.setRestoreLastUrl, toggled)
            }} />
          <SettingsListItemSwitch
            label='Show navigation toolbar'
            checked={hasNavigationToolbar}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, GenericServiceReducer.setHasNavigationToolbar, toggled)
            }} />
          <SettingsListItemSwitch
            divider={false}
            label='Enable Wavebox API (Experiemental)'
            checked={supportsWBGAPI}
            onChange={(evt, toggled) => {
              accountActions.reduceService(serviceId, GenericServiceReducer.setSupportsWBGAPI, toggled)
            }} />
        </SettingsListSection>
        <ServiceAppearanceSection
          serviceId={serviceId}
          beforeDisplayName={(isLast) => {
            return (
              <SettingsListItemSwitch
                key='use_page_title'
                divider={false}
                label='Use page title as Display Name'
                checked={usePageTitleAsDisplayName}
                onChange={(evt, toggled) => {
                  accountActions.reduceService(serviceId, GenericServiceReducer.setUsePageTitleAsDisplayName, toggled)
                }} />
            )
          }}
          displayNameDisabled={usePageTitleAsDisplayName}
          beforeColor={(isLast) => {
            return (
              <SettingsListItemSwitch
                key='use_page_theme'
                divider={false}
                label='Use page theme as Account Color'
                checked={usePageThemeAsColor}
                onChange={(evt, toggled) => {
                  accountActions.reduceService(serviceId, GenericServiceReducer.setUsePageThemeAsColor, toggled)
                }} />
            )
          }}
          colorDisabled={usePageThemeAsColor}
        />
        <ServiceBadgeSection serviceId={serviceId} />
        <ServiceBehaviourSection serviceId={serviceId} />
        <ServiceNotificationSection serviceId={serviceId} />
        <ServiceAdvancedSection serviceId={serviceId} onRequestEditCustomCode={onRequestEditCustomCode} />
      </div>
    )
  }
}
