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
      <div {...passProps}>
        <SettingsListSection>
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
            label='Restore last page on load'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setRestoreLastUrl, toggled)
            }}
            checked={service.restoreLastUrl} />
        </SettingsListSection>
        <AccountAppearanceSettingsSection mailbox={mailbox} />
        <ServiceBadgeSettingsSection mailbox={mailbox} service={service} />
        <ServiceNotificationSettingsSection mailbox={mailbox} service={service} />
        <ServiceBehaviourSettingsSection mailbox={mailbox} service={service} />
        <ServiceCustomCodeSettingsSection
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode} />
        <SettingsListSection title='UserAgent'>
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
          mailbox={mailbox}
          showRestart={showRestart}
          windowOpenAfter={container.hasWindowOpenOverrides ? (
            <span>
              {mailbox.getAllWindowOpenOverrideUserConfigs().map((config) => {
                return (
                  <SettingsListItemSwitch
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
        <AccountDestructiveSettingsSection mailbox={mailbox} />
        <SettingsListSection title='About'>
          <SettingsListItemText primary='Container ID' secondary={container.id} />
          <SettingsListItemText primary='Container Version' secondary={container.version} />
        </SettingsListSection>
      </div>
    )
  }
}
