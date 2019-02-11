import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { remote } from 'electron'
import { accountStore, accountActions } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import {
  Button, Select, TextField, MenuItem, Checkbox,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, FormControlLabel
} from '@material-ui/core'
import CoreGoogleMailServiceReducer from 'shared/AltStores/Account/ServiceReducers/CoreGoogleMailServiceReducer'
import CoreGoogleMailService from 'shared/Models/ACAccounts/Google/CoreGoogleMailService'

const styles = {
  kbIcon: {
    marginRight: 6,
    verticalAlign: 'sub',
    fontSize: '20px'
  },
  linkPara: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: blue[600],
    marginTop: 0,
    marginBottom: 0
  }
}

@withStyles(styles)
class GoogleMailUnreadSettings extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired
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
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState(
        this.extractStateForService(nextProps.serviceId, accountState)
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return this.extractStateForService(this.props.serviceId, accountState)
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      customUnreadQuery: service.customUnreadQuery,
      customUnreadLabelWatchString: service.customUnreadLabelWatchString,
      customUnreadCountFromLabel: service.customUnreadCountFromLabel,
      customUnreadCountLabel: service.customUnreadCountLabel,
      customUnreadCountLabelField: service.customUnreadCountLabelField
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the help kb article
  * @param evt: the event that fired
  */
  handleOpenKBArticle = (evt) => {
    evt.preventDefault()
    remote.shell.openExternal('https://wavebox.io/kb/custom-google-unread-counts')
  }

  /**
  * Resets the custom unread mode
  */
  handleResetCustom = () => {
    const { serviceId, onRequestClose } = this.props
    accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadQuery, '')
    accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadLabelWatchString, '')
    accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadCountFromLabel, false)
    setTimeout(() => {
      onRequestClose()
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      classes,
      onRequestClose
    } = this.props
    const {
      hasService,
      customUnreadQuery,
      customUnreadLabelWatchString,
      customUnreadCountFromLabel,
      customUnreadCountLabel,
      customUnreadCountLabelField
    } = this.state
    if (!hasService) { return false }
    const hasCustomQueryConfiguration = !!customUnreadQuery || !!customUnreadLabelWatchString

    return (
      <React.Fragment>
        <DialogTitle>Advanced unread options</DialogTitle>
        <DialogContent>
          <p className={classes.linkPara} onClick={this.handleOpenKBArticle}>
            <HelpOutlineIcon className={classes.kbIcon} />
            Find out how to configure a custom unread in the Knowledge Base
          </p>
          <TextField
            key={`customUnreadQuery_${serviceId}`}
            name={`customUnreadQuery_${serviceId}`}
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
              accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadQuery, customUnreadQuery)
            }} />
          <TextField
            key={`customUnreadWatchLabels_${serviceId}`}
            name={`customUnreadWatchLabels_${serviceId}`}
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
              accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadLabelWatchString, customUnreadLabelWatchString)
            }} />
          <FormControl fullWidth>
            <FormControlLabel
              label='Take unread count from single label'
              control={(
                <Checkbox
                  checked={customUnreadCountFromLabel}
                  color='primary'
                  onChange={(evt, toggled) => {
                    accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadCountFromLabel, toggled)
                  }} />
              )} />
          </FormControl>
          <TextField
            key={`customUnreadCountLabel_${serviceId}`}
            name={`customUnreadCountLabel_${serviceId}`}
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
              accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadCountLabel, customUnreadCountLabel)
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
                accountActions.reduceService(serviceId, CoreGoogleMailServiceReducer.setCustomUnreadCountLabelField, evt.target.value)
              }}>
              {CoreGoogleMailService.CUSTOM_UNREAD_COUNT_LABEL_FIELDS.map((fieldName) => {
                return (
                  <MenuItem key={fieldName} value={fieldName}>{fieldName}</MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            onClick={this.handleResetCustom}>
            Reset
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={onRequestClose}>
            Close
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default GoogleMailUnreadSettings
