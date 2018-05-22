import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountDestructiveSettingsSection from '../AccountDestructiveSettingsSection'
import AccountAppearanceSettingsSection from '../AccountAppearanceSettingsSection'
import AccountAdvancedSettingsSection from '../AccountAdvancedSettingsSection'
import ServiceBadgeSettingsSection from '../ServiceBadgeSettingsSection'
import ServiceNotificationSettingsSection from '../ServiceNotificationSettingsSection'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import ServiceCustomCodeSettingsSection from '../ServiceCustomCodeSettingsSection'
import ServiceBehaviourSettingsSection from '../ServiceBehaviourSettingsSection'
import { mailboxActions, ContainerDefaultServiceReducer, ContainerMailboxReducer } from 'stores/mailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemTextField from 'wbui/SettingsListItemTextField'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import SettingsListItemText from 'wbui/SettingsListItemText'
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
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

export default class ContainerAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles toggling using the custom agent
  * @param evt: the event that fired
  * @param toggled: the toggled state
  */
  handleChangeUseCustomUserAgent = (evt, toggled) => {
    mailboxActions.reduce(this.props.mailbox.id, ContainerMailboxReducer.setUseCustomUserAgent, toggled)
    this.props.showRestart()
  }

  /**
  * Handles the custom user agent changing
  * @param evt: the event that fired
  */
  handleChangeCustomUserAgent = (evt) => {
    mailboxActions.reduce(this.props.mailbox.id, ContainerMailboxReducer.setCustomUserAgentString, evt.target.value)
    this.props.showRestart()
  }

  /**
  * Restores the user agent defaults
  * @param evt: the event that fired
  */
  handleResetCustomUserAgent = (evt) => {
    mailboxActions.reduce(this.props.mailbox.id, ContainerMailboxReducer.restoreUserAgentDefaults)
    this.props.showRestart()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailbox,
      showRestart,
      onRequestEditCustomCode,
      ...passProps
    } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)
    const container = mailbox.container

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
          { id: `sec-${mailbox.id}-${service.type}-destructive`, name: 'Tools', IconClass: BuildIcon },
          { id: `sec-${mailbox.id}-${service.type}-about`, name: 'About', IconClass: HelpOutlineIcon }
        ]}
        {...passProps}>
        <SettingsListSection
          title='Account'
          icon={<AccountCircleIcon />}
          id={`sec-${mailbox.id}-${service.type}-account`}>
          <SettingsListItemTextField
            key={`displayName_${mailbox.userDisplayName}`}
            label='Account Name'
            textFieldProps={{
              defaultValue: mailbox.userDisplayName,
              placeholder: 'My Account',
              onBlur: (evt) => { mailboxActions.reduce(this.props.mailbox.id, ContainerMailboxReducer.setDisplayName, evt.target.value) }
            }} />
          <SettingsListItemSwitch
            label='Show navigation toolbar'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setHasNavigationToolbar, toggled)
            }}
            checked={service.hasNavigationToolbar} />
          <SettingsListItemSwitch
            divider={false}
            label='Restore last page on load'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setRestoreLastUrl, toggled)
            }}
            checked={service.restoreLastUrl} />
        </SettingsListSection>
        <AccountAppearanceSettingsSection
          mailbox={mailbox}
          id={`sec-${mailbox.id}-${service.type}-appearance`} />
        <ServiceBadgeSettingsSection
          mailbox={mailbox}
          service={service}
          id={`sec-${mailbox.id}-${service.type}-badge`} />
        <ServiceNotificationSettingsSection
          mailbox={mailbox}
          service={service}
          id={`sec-${mailbox.id}-${service.type}-notifications`} />
        <ServiceBehaviourSettingsSection
          mailbox={mailbox}
          service={service}
          id={`sec-${mailbox.id}-${service.type}-behaviour`} />
        <ServiceCustomCodeSettingsSection
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode}
          id={`sec-${mailbox.id}-${service.type}-code`} />
        <SettingsListSection
          title='UserAgent'
          icon={<CompareArrowsIcon />}
          id={`sec-${mailbox.id}-${service.type}-useragent`}>
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
            divider={false}
            label='Restore defaults (Requires restart)'
            onClick={this.handleResetCustomUserAgent} />
        </SettingsListSection>
        <AccountAdvancedSettingsSection
          mailbox={mailbox}
          showRestart={showRestart}
          id={`sec-${mailbox.id}-${service.type}-advanced`}
          windowOpenAfter={container.hasWindowOpenOverrides ? (
            <span>
              {mailbox.getAllWindowOpenOverrideUserConfigs().map((config, i, arr) => {
                return (
                  <SettingsListItemSwitch
                    divider={i !== (arr.length - 1)}
                    key={config.id}
                    label={config.label}
                    onChange={(evt, toggled) => {
                      mailboxActions.reduce(mailbox.id, ContainerMailboxReducer.setWindowOpenUserConfig, config.id, toggled)
                    }}
                    checked={config.value} />
                )
              })}
            </span>
          ) : undefined} />
        <AccountDestructiveSettingsSection
          mailbox={mailbox}
          id={`sec-${mailbox.id}-${service.type}-destructive`} />
        <SettingsListSection
          title='About'
          icon={<HelpOutlineIcon />}
          id={`sec-${mailbox.id}-${service.type}-about`}>
          <SettingsListItemText primary='Container ID' secondary={container.id} />
          <SettingsListItemText divider={false} primary='Container Version' secondary={container.version} />
        </SettingsListSection>
      </AccountSettingsScroller>
    )
  }
}
