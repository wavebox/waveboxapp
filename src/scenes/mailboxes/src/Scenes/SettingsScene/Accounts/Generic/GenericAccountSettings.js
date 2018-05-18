import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountDestructiveSettings from '../AccountDestructiveSettings'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListTextField from 'wbui/SettingsListTextField'
import SettingsListButton from 'wbui/SettingsListButton'
import validUrl from 'valid-url'

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
      <div {...passProps}>
        <SettingsListSection>
          <SettingsListTextField
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
          <SettingsListTextField
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
          <SettingsListSwitch
            label='Restore last page on load'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setRestoreLastUrl, toggled)
            }}
            checked={service.restoreLastUrl} />
          <SettingsListSwitch
            label='Show navigation toolbar'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setHasNavigationToolbar, toggled)
            }}
            checked={service.hasNavigationToolbar} />
          <SettingsListSwitch
            label='Use Page title as Display Name'
            onChange={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageTitleAsDisplayName, toggled)
            }}
            checked={mailbox.usePageTitleAsDisplayName} />
          <SettingsListSwitch
            label='Use Page theme as Account Color'
            onChange={(evt, toggled) => {
              mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageThemeAsColor, toggled)
            }}
            checked={mailbox.usePageThemeAsColor} />
          <SettingsListSwitch
            label='Enable Wavebox API (Experiemental)'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setsupportsGuestConfig, toggled)
            }}
            checked={service.supportsGuestConfig} />
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
        <AccountAdvancedSettings mailbox={mailbox} showRestart={showRestart} />
        <AccountDestructiveSettings mailbox={mailbox} />
      </div>
    )
  }
}
