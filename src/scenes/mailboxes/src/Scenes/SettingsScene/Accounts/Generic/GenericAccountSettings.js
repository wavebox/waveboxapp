import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountAppearanceSettingsSection from '../AccountAppearanceSettingsSection'
import AccountAdvancedSettingsSection from '../AccountAdvancedSettingsSection'
import AccountDestructiveSettingsSection from '../AccountDestructiveSettingsSection'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import validUrl from 'valid-url'
import AccountSettingsScroller from '../AccountSettingsScroller'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import AdjustIcon from '@material-ui/icons/Adjust'
import NotificationsIcon from '@material-ui/icons/Notifications'
import HotelIcon from '@material-ui/icons/Hotel'
import CodeIcon from '@material-ui/icons/Code'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import BuildIcon from '@material-ui/icons/Build'
import TuneIcon from '@material-ui/icons/Tune'

export default class GenericAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      displayNameError: null,
      serviceUrlError: null
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the name changing
  * @param evt: the event that fired
  */
  handleNameChange = (evt) => {
    const value = evt.target.value
    if (!value) {
      this.setState({ displayNameError: 'Display name is required' })
    } else {
      this.setState({ displayNameError: null })
      mailboxActions.reduce(this.props.mailbox.id, GenericMailboxReducer.setDisplayName, value)
    }
  }

  /**
  * Handles the url changing
  * @param evt: the event that fired
  */
  handleUrlChange = (evt) => {
    const value = evt.target.value
    if (!value) {
      this.setState({ serviceUrlError: 'Service url is required' })
    } else if (!validUrl.isUri(value)) {
      this.setState({ serviceUrlError: 'Service url is not a valid url' })
    } else {
      this.setState({ serviceUrlError: null })
      mailboxActions.reduceService(
        this.props.mailbox.id,
        CoreMailbox.SERVICE_TYPES.DEFAULT,
        GenericDefaultServiceReducer.setUrl,
        value
      )
    }
  }

  /**
  * Handles toggling using the custom agent
  * @param evt: the event that fired
  * @param toggled: the toggled state
  */
  handleChangeUseCustomUserAgent = (evt, toggled) => {
    mailboxActions.reduce(this.props.mailbox.id, GenericMailboxReducer.setUseCustomUserAgent, toggled)
    this.props.showRestart()
  }

  /**
  * Handles the custom user agent changing
  * @param evt: the event that fired
  */
  handleChangeCustomUserAgent = (evt) => {
    mailboxActions.reduce(this.props.mailbox.id, GenericMailboxReducer.setCustomUserAgentString, evt.target.value)
    this.props.showRestart()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { displayNameError, serviceUrlError } = this.state
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)

    return (
      <AccountSettingsScroller
        scrollspyItems={[
          { id: `sec-${mailbox.id}-${service.type}-account`, name: 'Account', IconClass: AccountCircleIcon },
          { id: `sec-${mailbox.id}-${service.type}-appearance`, name: 'Appearance', IconClass: ViewQuiltIcon },
          { id: `sec-${mailbox.id}-${service.type}-badge`, name: 'Badge', IconClass: AdjustIcon },
          { id: `sec-${mailbox.id}-${service.type}-notifications`, name: 'Notifications', IconClass: NotificationsIcon },
          { id: `sec-${mailbox.id}-${service.type}-behaviour`, name: 'Behaviour & Sleep', IconClass: HotelIcon },
          { id: `sec-${mailbox.id}-${service.type}-code`, name: 'Code & Userscripts', IconClass: CodeIcon },
          { id: `sec-${mailbox.id}-${service.type}-useragent`, name: 'UserAgent', IconClass: CompareArrowsIcon },
          { id: `sec-${mailbox.id}-${service.type}-advanced`, name: 'Advanced', IconClass: TuneIcon },
          { id: `sec-${mailbox.id}-${service.type}-destructive`, name: 'Tools', IconClass: BuildIcon }
        ]}
        {...passProps}>
        <SettingsListSection
          icon={<AccountCircleIcon />}
          id={`sec-${mailbox.id}-${service.type}-account`}
          title='Account'>
          <SettingsListItemTextField
            key={`displayName_${mailbox.displayName}`}
            disabled={mailbox.usePageTitleAsDisplayName}
            label='Account Name'
            textFieldProps={{
              defaultValue: mailbox.displayName,
              placeholder: 'My Account',
              error: !!displayNameError,
              helperText: displayNameError,
              onBlur: this.handleNameChange
            }} />
          <SettingsListItemSwitch
            label='Use page title as Display Name'
            onChange={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageTitleAsDisplayName, toggled)
            }}
            checked={mailbox.usePageTitleAsDisplayName} />
          <SettingsListItemTextField
            key={`service_${service.url}`}
            label='Website Url'
            textFieldProps={{
              type: 'url',
              defaultValue: service.url,
              placeholder: 'https://wavebox.io',
              error: !!serviceUrlError,
              helperText: serviceUrlError,
              onBlur: this.handleUrlChange
            }} />
          <SettingsListItemSwitch
            label='Restore last page on load'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setRestoreLastUrl, toggled)
            }}
            checked={service.restoreLastUrl} />
          <SettingsListItemSwitch
            label='Show navigation toolbar'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setHasNavigationToolbar, toggled)
            }}
            checked={service.hasNavigationToolbar} />
          <SettingsListItemSwitch
            label='Use page theme as Account Color'
            onChange={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageThemeAsColor, toggled)
            }}
            checked={mailbox.usePageThemeAsColor} />
          <SettingsListItemSwitch
            divider={false}
            label='Enable Wavebox API (Experiemental)'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setsupportsGuestConfig, toggled)
            }}
            checked={service.supportsGuestConfig} />
        </SettingsListSection>
        <AccountAppearanceSettingsSection
          id={`sec-${mailbox.id}-${service.type}-appearance`}
          mailbox={mailbox} />
        <ServiceBadgeSettingsSection
          id={`sec-${mailbox.id}-${service.type}-badge`}
          mailbox={mailbox}
          service={service} />
        <ServiceNotificationSettingsSection
          id={`sec-${mailbox.id}-${service.type}-notifications`}
          mailbox={mailbox}
          service={service} />
        <ServiceBehaviourSettingsSection
          id={`sec-${mailbox.id}-${service.type}-behaviour`}
          mailbox={mailbox}
          service={service} />
        <ServiceCustomCodeSettingsSection
          id={`sec-${mailbox.id}-${service.type}-code`}
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode} />
        <SettingsListSection
          id={`sec-${mailbox.id}-${service.type}-useragent`}
          title='UserAgent'
          icon={<CompareArrowsIcon />}>
          <SettingsListItemSwitch
            label='Use custom UserAgent (Requires restart)'
            onChange={this.handleChangeUseCustomUserAgent}
            checked={mailbox.useCustomUserAgent} />
          <SettingsListItemTextField
            key={`userAgent_${mailbox.customUserAgentString}`}
            disabled={!mailbox.useCustomUserAgent}
            label='Custom UserAgent String (Requires restart)'
            textFieldProps={{
              defaultValue: mailbox.customUserAgentString,
              onBlur: this.handleChangeCustomUserAgent
            }} />
          <SettingsListItemButton
            label='Restore defaults (Requires restart)'
            onClick={this.handleResetCustomUserAgent} />
        </SettingsListSection>
        <AccountAdvancedSettingsSection
          id={`sec-${mailbox.id}-${service.type}-advanced`}
          mailbox={mailbox}
          showRestart={showRestart} />
        <AccountDestructiveSettingsSection
          id={`sec-${mailbox.id}-${service.type}-destructive`}
          mailbox={mailbox} />
      </AccountSettingsScroller>
    )
  }
}
