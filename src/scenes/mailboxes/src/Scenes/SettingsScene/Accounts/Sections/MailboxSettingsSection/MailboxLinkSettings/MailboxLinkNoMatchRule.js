import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
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
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
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
      ...this.extractStateForMailbox(this.props.mailboxId, accountState)
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.mailboxId, accountState)
    )
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
      valueServiceName: accountState.resolvedFullServiceName(mailbox.userNoMatchWindowOpenRule.serviceId)
    } : {
      value: {},
      valueServiceName: undefined
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the value changing
  * @param evt: the event that fired
  */
  handleChange = (evt) => {
    accountActions.reduceMailbox(
      this.props.mailboxId,
      MailboxReducer.setUserNoMatchWindowOpenRule,
      evt.target.value,
      undefined // serviceId
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
      valueServiceName
    } = this.state

    return (
      <SettingsListItem className={classNames(classes.root, className)} {...passProps}>
        <SettingsListTypography
          primary={`New window behaviour (that don't match any rules)`} />
        <FormControl component='fieldset'>
          <RadioGroup
            value={value.mode}
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
                label={`Service Window (${valueServiceName || 'Deleted Service'})`} />
            ) : undefined}
            {value.mode === ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB ? (
              <FormControlLabel
                value={ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB}
                control={<Radio color='primary' className={classes.radio} />}
                label={`Running Service Tab (${valueServiceName || 'Deleted Service'})`} />
            ) : undefined}
          </RadioGroup>
        </FormControl>
      </SettingsListItem>
    )
  }
}

export default MailboxLinkNoMatchRule
