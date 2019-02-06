import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import SettingsListItem from 'wbui/SettingsListItem'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import SettingsListTypography from 'wbui/SettingsListTypography'
import classNames from 'classnames'

const styles = {
  root: {
    display: 'block'
  },
  radio: {
    paddingTop: 2,
    paddingBottom: 2
  }
}

@withStyles(styles)
class MailboxLinkNoMatchRule extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      const accountState = accountStore.getState()
      this.setState({
        ...this.extractStateForMailbox(nextProps.mailboxId, accountState)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      ...this.extractStateForMailbox(this.props.mailboxId, accountState),
      customLinkProviderNames: settingsStore.getState().os.customLinkProviderNames
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.mailboxId, accountState)
    )
  }

  settingsChanged = (settingsState) => {
    this.setState({
      customLinkProviderNames: settingsState.os.customLinkProviderNames
    })
  }

  /**
  * Gets the mailbox state config
  * @param mailboxId: the id of the mailbox
  * @param accountState: the account state
  */
  extractStateForMailbox (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    return mailbox ? {
      value: mailbox.userNoMatchWindowOpenRule,
      valueAccountName: mailbox.userNoMatchWindowOpenRule.serviceId
        ? accountState.resolvedFullServiceName(mailbox.userNoMatchWindowOpenRule.serviceId)
        : mailbox.userNoMatchWindowOpenRule.mailboxId
          ? accountState.resolvedMailboxDisplayName(mailbox.userNoMatchWindowOpenRule.mailboxId)
          : undefined
    } : {
      value: {},
      valueAccountName: undefined
    }
  }

  /* **************************************************************************/
  // Data utils
  /* **************************************************************************/

  /**
  * Converts a rule to a string which can be used in the select
  * @param rule: the rule
  * @return a string representation
  */
  ruleToString (rule) {
    return rule.mode === ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER
      ? `${ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER}:${rule.providerId}`
      : rule.mode
  }

  /**
  * Converts a rule string from the select back to a rule
  * @param str: the rule string
  * @return a new version of the rule
  */
  stringToRule (str) {
    return str.startsWith(ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER) ? {
      mode: ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER,
      targetInfo: {
        providerId: str.replace(`${ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER}:`, '')
      }
    } : { mode: str }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the value changing
  * @param evt: the event that fired
  */
  handleChange = (evt) => {
    const rule = this.stringToRule(evt.target.value)
    accountActions.reduceMailbox(
      this.props.mailboxId,
      MailboxReducer.setUserNoMatchWindowOpenRule,
      rule.mode,
      rule.targetInfo
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      mailboxId,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      value,
      valueAccountName,
      customLinkProviderNames
    } = this.state

    return (
      <SettingsListItem className={classNames(classes.root, className)} {...passProps}>
        <SettingsListTypography
          primary={`New window behaviour (that don't match any rules)`} />
        <FormControl component='fieldset'>
          <RadioGroup
            value={this.ruleToString(value)}
            onChange={this.handleChange}>
            <FormControlLabel
              value={ACMailbox.USER_WINDOW_OPEN_MODES.BROWSER}
              control={<Radio color='primary' className={classes.radio} />}
              label='Default Browser' />
            <FormControlLabel
              value={ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX}
              control={<Radio color='primary' className={classes.radio} />}
              label='Wavebox Browser' />
            <FormControlLabel
              value={ACMailbox.USER_WINDOW_OPEN_MODES.ASK}
              control={<Radio color='primary' className={classes.radio} />}
              label='Ask each time' />
            {value.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW ? (
              <FormControlLabel
                value={ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW}
                control={<Radio color='primary' className={classes.radio} />}
                label={`Account Window (${valueAccountName || 'Deleted Account'})`} />
            ) : undefined}
            {value.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW ? (
              <FormControlLabel
                value={ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW}
                control={<Radio color='primary' className={classes.radio} />}
                label={`Account Window (${valueAccountName || 'Deleted Account'})`} />
            ) : undefined}
            {value.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB ? (
              <FormControlLabel
                value={ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB}
                control={<Radio color='primary' className={classes.radio} />}
                label={`Running Service Tab (${valueAccountName || 'Deleted Account'})`} />
            ) : undefined}
            {Object.keys(customLinkProviderNames).length ? (
              Object.keys(customLinkProviderNames).map((id) => {
                return (
                  <FormControlLabel
                    key={id}
                    value={`${ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER}:${id}`}
                    control={<Radio color='primary' className={classes.radio} />}
                    label={`Custom (${customLinkProviderNames[id]})`} />
                )
              })
            ) : undefined}
            {value.mode === ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER && !customLinkProviderNames[value.providerId] ? (
              <FormControlLabel
                value={this.ruleToString(value)}
                control={<Radio color='primary' className={classes.radio} />}
                label={`Custom (Deleted Provider)`} />
            ) : undefined}
          </RadioGroup>
        </FormControl>
      </SettingsListItem>
    )
  }
}

export default MailboxLinkNoMatchRule
