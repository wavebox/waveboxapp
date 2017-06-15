import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, TextField, Toggle } from 'material-ui'
import { Row, Col } from 'Components/Grid'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import styles from '../../SettingStyles'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountSleepableSettings from '../AccountSleepableSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
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
        <Row>
          <Col md={6}>
            <Paper zDepth={1} style={styles.paper}>
              <TextField
                key={mailbox.displayName}
                fullWidth
                floatingLabelFixed
                hintText='My Website'
                floatingLabelText='Website Name'
                defaultValue={mailbox.displayName}
                errorText={displayNameError}
                onBlur={this.handleNameChange} />
              <TextField
                key={service.url}
                fullWidth
                type='url'
                floatingLabelFixed
                hintText='https://wavebox.io'
                floatingLabelText='Website Url'
                defaultValue={service.url}
                errorText={serviceUrlError}
                onBlur={this.handleUrlChange} />
              <Toggle
                toggled={service.openWindowsExternally}
                label='Open new windows in default browser'
                labelPosition='right'
                onToggle={(evt, toggled) => {
                  mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setOpenWindowsExternally, toggled)
                }} />
              <Toggle
                toggled={service.hasNavigationToolbar}
                label='Show navigation toolbar'
                labelPosition='right'
                onToggle={(evt, toggled) => {
                  mailboxActions.reduceService(mailbox.id, service.type, GenericDefaultServiceReducer.setHasNavigationToolbar, toggled)
                }} />
              <Toggle
                toggled={mailbox.usePageTitleAsDisplayName}
                label='Use Page title as Display Name'
                labelPosition='right'
                onToggle={(evt, toggled) => {
                  mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageTitleAsDisplayName, toggled)
                }} />
              <Toggle
                toggled={mailbox.usePageThemeAsColor}
                label='Use Page theme as Account Color'
                labelPosition='right'
                onToggle={(evt, toggled) => {
                  mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageThemeAsColor, toggled)
                }} />
            </Paper>
            <AccountAppearanceSettings mailbox={mailbox} />
            <AccountBadgeSettings mailbox={mailbox} />
            <AccountNotificationSettings mailbox={mailbox} />
          </Col>
          <Col md={6}>
            <Paper zDepth={1} style={styles.paper}>
              <AccountSleepableSettings mailbox={mailbox} service={service} />
              <br />
              <AccountCustomCodeSettings
                mailbox={mailbox}
                service={service}
                onRequestEditCustomCode={onRequestEditCustomCode} />
            </Paper>
            <AccountAdvancedSettings mailbox={mailbox} showRestart={showRestart}>
              <Toggle
                toggled={mailbox.useCustomUserAgent}
                label='Use custom UserAgent'
                labelPosition='right'
                onToggle={this.handleChangeUseCustomUserAgent} />
              <TextField
                key={service.url}
                disabled={!mailbox.useCustomUserAgent}
                fullWidth
                floatingLabelFixed
                floatingLabelText='Custom UserAgent String'
                defaultValue={mailbox.customUserAgentString}
                onBlur={this.handleChangeCustomUserAgent} />
            </AccountAdvancedSettings>
          </Col>
        </Row>
      </div>
    )
  }
}
