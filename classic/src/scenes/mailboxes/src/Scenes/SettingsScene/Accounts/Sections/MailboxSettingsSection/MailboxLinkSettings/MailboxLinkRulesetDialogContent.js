import PropTypes from 'prop-types'
import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'
import { withStyles } from '@material-ui/core/styles'
import StyleMixins from 'wbui/Styles/StyleMixins'
import {
  DialogTitle, DialogContent, DialogActions,
  List, ListItemText, ListItem, ListItemSecondaryAction,
  Button, IconButton, Typography
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import ConfirmButton from 'wbui/ConfirmButton'

const humanizedModes = {
  [ACMailbox.USER_WINDOW_OPEN_MODES.BROWSER]: 'In default browser',
  [ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX]: 'In wavebox window',
  [ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_WINDOW]: 'In account window',
  [ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_MAILBOX_WINDOW]: 'In account window',
  [ACMailbox.USER_WINDOW_OPEN_MODES.WAVEBOX_SERVICE_RUNNING_TAB]: 'In running service tab',
  [ACMailbox.USER_WINDOW_OPEN_MODES.ASK]: 'Ask what to do',
  [ACMailbox.USER_WINDOW_OPEN_MODES.CUSTOM_PROVIDER]: 'Custom'
}

const styles = {
  dialogContent: {
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  dialogActions: {
    justifyContent: 'space-between'
  }
}

@withStyles(styles)
class MailboxLinkRulesetDialogContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired
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
      this.setState(
        this.extractStateForMailbox(nextProps.mailboxId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      providerNames: settingsStore.getState().os.customLinkProviderNames,
      ...this.extractStateForMailbox(this.props.mailboxId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForMailbox(this.props.mailboxId, accountState)
    )
  }

  settingsChanged = (settingsState) => {
    this.setState({
      providerNames: settingsState.os.customLinkProviderNames
    })
  }

  /**
  * Gets the mailbox state config
  * @param mailboxId: the id of the mailbox
  * @param accountState: the account state
  */
  extractStateForMailbox (mailboxId, accountState) {
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      serviceNames: accountState.allResolvedFullServiceNames(),
      mailboxNames: accountState.allResolvedFullMailboxNames(),
      ...(mailbox ? {
        userWindowOpenRules: mailbox.userWindowOpenRules
      } : {
        userWindowOpenRules: []
      })
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Deletes a single rule
  * @param index: the index of the rule
  */
  handleDeleteRule = (index) => {
    accountActions.reduceMailbox(
      this.props.mailboxId,
      MailboxReducer.removeUserWindowOpenRule,
      index
    )
  }

  /**
  * Deletes all the rules
  */
  handleDeleteAllRules = () => {
    accountActions.reduceMailbox(
      this.props.mailboxId,
      MailboxReducer.clearAllUserWindowOpenRules
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders a rule
  * @param rule: the rule to render
  * @param index: the index of the rule
  * @param mailboxNames: the full list of mailbox names
  * @param serviceNames: the full service name list
  * @param providerNames: the full list of provider names
  * @return jsx
  */
  renderRule ({ rule, serviceId, mailboxId, providerId, mode }, index, divider, mailboxNames, serviceNames, providerNames) {
    return (
      <ListItem key={`${index}`} divider={divider} disableGutters>
        <ListItemText
          primary={[
            rule.hostname,
            rule.queryKey ? `${rule.queryKey}=${rule.queryHostname}` : undefined
          ].filter((i) => !!i).join(' ')}
          secondary={[
            humanizedModes[mode],
            mailboxId
              ? `(${mailboxNames[mailboxId] || 'Deleted Mailbox'})`
              : serviceId
                ? `(${serviceNames[serviceId] || 'Deleted Service'})`
                : providerId
                  ? `(${providerNames[providerId] || 'Deleted Provider'})`
                  : undefined
          ].filter((i) => !!i).join(' ')} />
        <ListItemSecondaryAction>
          <IconButton onClick={() => this.handleDeleteRule(index)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render () {
    const {
      classes,
      onRequestClose
    } = this.props
    const {
      userWindowOpenRules,
      serviceNames,
      mailboxNames,
      providerNames
    } = this.state

    return (
      <React.Fragment>
        <DialogTitle disableTypography>
          <Typography variant='subtitle1'>
            Links that match these rules will follow their given behaviour
          </Typography>
          <Typography variant='subtitle2' color='textSecondary'>
            Rules can be configured by setting the default action to ask and saving the behaviour
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List dense>
            {userWindowOpenRules.length ? (
              userWindowOpenRules.map((rule, index, arr) => (
                this.renderRule(rule, index, index !== arr.length - 1, mailboxNames, serviceNames, providerNames)
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary='No rules'
                  secondary='Rules can be configured by setting the default action to ask' />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <ConfirmButton
            size='small'
            content='Delete all rules'
            confirmContent='Click again to confirm'
            confirmWaitMs={4000}
            onConfirmedClick={this.handleDeleteAllRules} />
          <Button variant='contained' color='primary' onClick={onRequestClose}>
            Done
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default MailboxLinkRulesetDialogContent
