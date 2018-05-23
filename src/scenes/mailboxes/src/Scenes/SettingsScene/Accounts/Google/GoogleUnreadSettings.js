import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import SettingsListItem from 'wbui/SettingsListItem'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import {
  Button, Select, TextField, MenuItem, Checkbox, ListItemSecondaryAction, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, FormControlLabel
} from '@material-ui/core'

const KB_ARTICLE_URL = 'https://wavebox.io/kb/custom-google-unread-counts'
const SERVICE_STATE_KEYS = [
  'customUnreadQuery',
  'customUnreadLabelWatchString',
  'customUnreadCountFromLabel',
  'customUnreadCountLabel',
  'customUnreadCountLabelField'
]

const styles = {
  customUnreadModeListItem: {
    paddingRight: 80
  },
  customUnreadModeIndicator: {
    display: 'inline-block',
    marginTop: 10
  },
  customUnreadModeIconIndicator: {
    width: 18,
    height: 18,
    marginRight: 6,
    verticalAlign: 'bottom'
  },

  kbIcon: {
    marginRight: 6
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[800]
  }
}

@withStyles(styles)
class GoogleUnreadSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState(this.generateState(nextProps.service))
    } else {
      this.setState(this.generateStateUpdate(this.props.service, nextProps.service))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state for the component
  * @param service: the service to generate for
  * @return the state
  */
  generateState (service) {
    return {
      ...(SERVICE_STATE_KEYS.reduce((acc, k) => {
        acc[k] = service[k]
        return acc
      }, {})),
      showCustomUnreadSettings: service.hasCustomUnreadQuery || service.hasCustomUnreadLabelWatch
    }
  }

  /**
  * Generates the state update between two services
  * @param prevService: the previous service
  * @param nextService: the next service
  * @return a state update
  */
  generateStateUpdate (prevService, nextService) {
    return SERVICE_STATE_KEYS.reduce((acc, k) => {
      if (prevService[k] !== nextService[k]) {
        acc[k] = nextService[k]
      }
      return acc
    }, {})
  }

  state = this.generateState(this.props.service)

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the help kb article
  * @param evt: the event that fired
  */
  handleOpenKBArticle = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal(KB_ARTICLE_URL)
  }

  /**
  * Resets the custom unread mode
  */
  handleResetCustom = () => {
    const { mailbox } = this.props
    mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadQuery, '')
    mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadLabelWatchString, '')
    mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountFromLabel, false)
    setTimeout(() => {
      this.setState({ showCustomUnreadSettings: false })
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Turns an unread mode into a friendlier string
  * @param mode: the unread mode
  * @return the humanized version
  */
  humanizeUnreadMode (mode) {
    switch (mode) {
      case GoogleDefaultService.UNREAD_MODES.INBOX_ALL:
        return 'All Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return 'Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return 'Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_ATOM:
        return '(Experimental) Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM:
        return '(Experimental) Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM:
        return '(Experimental) Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED:
        return 'Unread Unbundled Messages'
    }
  }

  render () {
    const {
      mailbox,
      service,
      classes,
      ...passProps
    } = this.props
    const {
      customUnreadQuery,
      customUnreadLabelWatchString,
      customUnreadCountFromLabel,
      customUnreadCountLabel,
      customUnreadCountLabelField,
      showCustomUnreadSettings
    } = this.state
    const hasCustomQueryConfiguration = !!customUnreadQuery || !!customUnreadLabelWatchString

    return (
      <SettingsListSection title='Unread & Sync' {...passProps}>
        <SettingsListItemSelect
          label='Unread Mode'
          disabled={hasCustomQueryConfiguration}
          value={service.unreadMode}
          options={Array.from(service.supportedUnreadModes).map((mode) => {
            return { value: mode, label: this.humanizeUnreadMode(mode) }
          })}
          onChange={(evt, value) => {
            mailboxActions.reduceService(mailbox.id, service.type, GoogleDefaultServiceReducer.setUnreadMode, value)
          }} />
        <SettingsListItem className={classes.customUnreadModeListItem} divider={false}>
          <ListItemText
            primary={(
              <span>
                A custom unread mode can be used to configure Wavebox to provide
                Notifications and Badges for a custom set of messages
              </span>
            )}
            secondary={(
              <span className={classes.customUnreadModeIndicator}>
                {hasCustomQueryConfiguration ? (
                  <CheckBoxIcon className={classes.customUnreadModeIconIndicator} />
                ) : (
                  <CheckBoxOutlineIcon className={classes.customUnreadModeIconIndicator} />
                )}
                Using custom unread mode
              </span>
            )} />
          <ListItemSecondaryAction>
            <Button variant='raised' size='small' onClick={() => this.setState({ showCustomUnreadSettings: true })}>
              Configure
            </Button>
          </ListItemSecondaryAction>
        </SettingsListItem>
        <Dialog
          disableEnforceFocus
          open={showCustomUnreadSettings}
          onClose={() => this.setState({ showCustomUnreadSettings: false })}>
          <DialogTitle>Advanced unread options</DialogTitle>
          <DialogContent>
            <p style={styles.link} onClick={this.handleOpenKBArticle}>
              <HelpOutlineIcon className={classes.kbIcon} />
              Find out how to configure a custom unread in the Knowledge Base
            </p>
            <TextField
              key={`customUnreadQuery_${mailbox.id}`}
              name={`customUnreadQuery_${mailbox.id}`}
              fullWidth
              InputLabelProps={{ shrink: true }}
              margin='normal'
              value={customUnreadQuery}
              label='Custom Unread Query'
              placeholder='label:inbox label:unread'
              error={hasCustomQueryConfiguration && !customUnreadQuery}
              helperText={hasCustomQueryConfiguration && !customUnreadQuery ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
              onChange={(evt) => this.setState({ customUnreadQuery: evt.target.value })}
              onBlur={(evt) => {
                mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadQuery, customUnreadQuery)
              }} />
            <TextField
              key={`customUnreadWatchLabels_${mailbox.id}`}
              name={`customUnreadWatchLabels_${mailbox.id}`}
              fullWidth
              InputLabelProps={{ shrink: true }}
              margin='normal'
              value={customUnreadLabelWatchString}
              label='Custom Unread Watch Labels (Comma seperated)'
              placeholder='INBOX, UNREAD'
              error={hasCustomQueryConfiguration && !customUnreadLabelWatchString}
              helperText={hasCustomQueryConfiguration && !customUnreadLabelWatchString ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
              onChange={(evt) => this.setState({ customUnreadLabelWatchString: evt.target.value })}
              onBlur={(evt) => {
                mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadLabelWatchString, customUnreadLabelWatchString)
              }} />
            <FormControl fullWidth>
              <FormControlLabel
                label='Take unread count from single label'
                control={(
                  <Checkbox
                    checked={customUnreadCountFromLabel}
                    color='primary'
                    onChange={(evt, toggled) => {
                      mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountFromLabel, toggled)
                    }} />
                )} />
            </FormControl>
            <TextField
              key={`customUnreadCountLabel_${mailbox.id}`}
              name={`customUnreadCountLabel_${mailbox.id}`}
              fullWidth
              InputLabelProps={{ shrink: true }}
              margin='normal'
              disabled={!customUnreadCountFromLabel}
              value={customUnreadCountLabel}
              label='Custom count label'
              placeholder='INBOX'
              error={customUnreadCountFromLabel && !customUnreadCountLabel}
              helperText={customUnreadCountFromLabel && !customUnreadCountLabel ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
              onChange={(evt) => this.setState({ customUnreadCountLabel: evt.target.value })}
              onBlur={(evt) => {
                mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountLabel, customUnreadCountLabel)
              }} />
            <FormControl fullWidth margin='normal'>
              <InputLabel>Custom count label field</InputLabel>
              <Select
                MenuProps={{
                  disableEnforceFocus: true,
                  MenuListProps: { dense: true }
                }}
                value={customUnreadCountLabelField}
                disabled={!customUnreadCountFromLabel}
                onChange={(evt) => {
                  mailboxActions.reduceService(mailbox.id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setCustomUnreadCountLabelField, evt.target.value)
                }}>
                {GoogleDefaultService.CUSTOM_UNREAD_COUNT_LABEL_FIELDS.map((fieldName) => {
                  return (
                    <MenuItem key={fieldName} value={fieldName}>{fieldName}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              variant='raised'
              onClick={this.handleResetCustom}>
              Reset
            </Button>
            <Button
              variant='raised'
              color='primary'
              onClick={() => this.setState({ showCustomUnreadSettings: false })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </SettingsListSection>
    )
  }
}

export default GoogleUnreadSettings
