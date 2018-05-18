import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountDestructiveSettings from '../AccountDestructiveSettings'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import { mailboxActions, ContainerDefaultServiceReducer, ContainerMailboxReducer } from 'stores/mailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListTextField from 'wbui/SettingsListTextField'
import SettingsListButton from 'wbui/SettingsListButton'
import { ListItemText } from '@material-ui/core'

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
          <SettingsListTextField
            key={`displayName_${mailbox.userDisplayName}`}
            label='Account Name'
            textFieldProps={{
              defaultValue: mailbox.userDisplayName,
              placeholder: 'My Account',
              onBlur: (evt) => { mailboxActions.reduce(this.props.mailbox.id, ContainerMailboxReducer.setDisplayName, evt.target.value) }
            }} />
          <SettingsListSwitch
            label='Show navigation toolbar'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setHasNavigationToolbar, toggled)
            }}
            checked={service.hasNavigationToolbar} />
          <SettingsListSwitch
            label='Restore last page on load'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setRestoreLastUrl, toggled)
            }}
            checked={service.restoreLastUrl} />
        </SettingsListSection>
        <AccountAppearanceSettings mailbox={mailbox} />
        <AccountBadgeSettings mailbox={mailbox} service={service} />
        <AccountNotificationSettings mailbox={mailbox} service={service} />
        <AccountBehaviourSettings mailbox={mailbox} service={service} />
        <AccountCustomCodeSettings
          mailbox={mailbox}
          service={service}
          onRequestEditCustomCode={onRequestEditCustomCode} />
        <SettingsListSection title='UserAgent'>
          <SettingsListSwitch
            label='Use custom UserAgent (Requires restart)'
            onChange={this.handleChangeUseCustomUserAgent}
            checked={mailbox.useCustomUserAgent} />
          <SettingsListTextField
            key={`userAgent_${mailbox.customUserAgentString}`}
            disabled={!mailbox.useCustomUserAgent}
            label='Custom UserAgent String (Requires restart)'
            textFieldProps={{
              defaultValue: mailbox.customUserAgentString,
              onBlur: this.handleChangeCustomUserAgent
            }} />
          <SettingsListButton
            label='Restore defaults (Requires restart)'
            onClick={this.handleResetCustomUserAgent} />
        </SettingsListSection>
        <AccountAdvancedSettings
          mailbox={mailbox}
          showRestart={showRestart}
          windowOpenAfter={container.hasWindowOpenOverrides ? (
            <span>
              {mailbox.getAllWindowOpenOverrideUserConfigs().map((config) => {
                return (
                  <SettingsListSwitch
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
        <AccountDestructiveSettings mailbox={mailbox} />
        <SettingsListSection title='About'>
          <ListItemText primary='Container ID' secondary={container.id} />
        </SettingsListSection>
        <SettingsListSection title='About'>
          <ListItemText primary='Container Version' secondary={container.version} />
        </SettingsListSection>
      </div>
    )
  }
}
