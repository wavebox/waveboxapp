import PropTypes from 'prop-types'
import React from 'react'
import { Button, Switch, Select, MenuItem, TextField, FormControlLabel, FormControl, InputLabel } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { accountActions, accountStore } from 'stores/account'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import { withStyles } from '@material-ui/core/styles'
import GenericServiceReducer from 'shared/AltStores/Account/ServiceReducers/GenericServiceReducer'
import MailboxReducer from 'shared/AltStores/Account/MailboxReducers/MailboxReducer'

const humanizedOpenModes = {
  [ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER]: 'Default Browser',
  [ACMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX]: 'Wavebox Browser'
}

const styles = {
  // Typography
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  },
  footerButton: {
    marginRight: 8
  }
}

@withStyles(styles)
class WizardConfigureGeneric extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.nameInputRef = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateState(nextProps))
    }
  }

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState (props) {
    const accountState = accountStore.getState()
    const mailboxId = (accountState.getService(props.serviceId) || {}).parentId
    const mailbox = accountState.getMailbox(mailboxId)
    return {
      mailboxId: mailboxId,
      serviceCount: mailbox ? mailbox.allServiceCount : 0,
      configureDisplayFromPage: true,
      defaultWindowOpenMode: ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER,
      hasNavigationToolbar: true,
      restoreLastUrl: true,
      displayNameError: null,
      displayName: ''
    }
  }

  accountUpdated = (accountState) => {
    const mailboxId = (accountState.getService(this.props.serviceId) || {}).parentId
    const mailbox = accountState.getMailbox(mailboxId)
    this.setState({
      mailboxId: mailboxId,
      serviceCount: mailbox ? mailbox.allServiceCount : 0
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user pressing cancel
  * @param serviceId: the mailbox id we're editing
  * @param onRequestCancel: the cancel call
  */
  handleCancel = () => {
    const { mailboxId, serviceCount } = this.state
    const { serviceId, onRequestCancel } = this.props
    // The mailbox has actually already been created at this point, so remove it.
    // Ideally this shouldn't happen but because this is handled under a configuration
    // step rather than an external creation step the mailbox is created early on in
    // its lifecycle
    if (serviceCount <= 1) {
      accountActions.removeMailbox(mailboxId)
    } else {
      accountActions.removeService(serviceId)
    }
    onRequestCancel()
  }

  /**
  * Handles the user pressing next
  * @param openSettings: set to true to open settings on close
  * @return true if it validated correctly
  */
  handleFinish = (openSettings) => {
    const {
      serviceId,
      onRequestCancel
    } = this.props
    const {
      displayName,
      configureDisplayFromPage,
      defaultWindowOpenMode,
      hasNavigationToolbar,
      restoreLastUrl,
      mailboxId
    } = this.state

    accountActions.reduceService(serviceId, GenericServiceReducer.setDisplayName, displayName)
    accountActions.reduceService(serviceId, GenericServiceReducer.setUsePageTitleAsDisplayName, configureDisplayFromPage)
    accountActions.reduceService(serviceId, GenericServiceReducer.setUsePageThemeAsColor, configureDisplayFromPage)
    accountActions.reduceService(serviceId, GenericServiceReducer.setHasNavigationToolbar, hasNavigationToolbar)
    accountActions.reduceService(serviceId, GenericServiceReducer.setRestoreLastUrl, restoreLastUrl)

    accountActions.reduceMailbox(mailboxId, MailboxReducer.setDefaultWindowOpenMode, defaultWindowOpenMode)

    if (openSettings) {
      onRequestCancel(`/settings/accounts/${mailboxId}`)
    } else {
      onRequestCancel()
    }
    return true
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceId, onRequestCancel, classes, ...passProps } = this.props
    const {
      configureDisplayFromPage,
      defaultWindowOpenMode,
      hasNavigationToolbar,
      restoreLastUrl,
      displayName,
      displayNameError
    } = this.state

    const buttons = (
      <div>
        <Button
          className={classes.footerButton}
          onClick={() => this.handleFinish(true)}>
          Account Settings
        </Button>
        <Button
          className={classes.footerButton}
          onClick={() => this.handleCancel()}>
          Cancel
        </Button>
        <Button
          variant='raised'
          color='primary'
          onClick={() => this.handleFinish(false)}>
          Finish
        </Button>
      </div>
    )

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        serviceId={serviceId}
        buttons={buttons}
        {...passProps}>
        <h2 className={classes.heading}>Configure your Account</h2>
        <TextField
          inputRef={(n) => { this.nameInputRef = n }}
          fullWidth
          InputLabelProps={{ shrink: true }}
          placeholder='My Website'
          label='Website Name'
          margin='normal'
          value={displayName}
          error={!!displayNameError}
          helperText={displayNameError}
          onChange={(evt) => this.setState({ displayName: evt.target.value })} />
        <FormControl fullWidth margin='normal'>
          <InputLabel>Open new windows in which Browser</InputLabel>
          <Select
            MenuProps={{ disableEnforceFocus: true }}
            value={defaultWindowOpenMode}
            fullWidth
            onChange={(evt) => {
              this.setState({ defaultWindowOpenMode: evt.target.value })
            }}>
            {Object.keys(ACMailbox.DEFAULT_WINDOW_OPEN_MODES).map((mode) => {
              return (<MenuItem key={mode} value={mode}>{humanizedOpenModes[mode]}</MenuItem>)
            })}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <FormControlLabel
            label='Restore last page on load'
            control={(
              <Switch
                checked={restoreLastUrl}
                color='primary'
                onChange={(evt, toggled) => { this.setState({ restoreLastUrl: toggled }) }} />
            )} />
        </FormControl>
        <FormControl fullWidth>
          <FormControlLabel
            label='Use Page Title & Theme to customise icon appearance'
            control={(
              <Switch
                checked={configureDisplayFromPage}
                color='primary'
                onChange={(evt, toggled) => this.setState({ configureDisplayFromPage: toggled })} />
            )} />
        </FormControl>
        <FormControl fullWidth>
          <FormControlLabel
            label='Show navigation toolbar'
            control={(
              <Switch
                checked={hasNavigationToolbar}
                color='primary'
                onChange={(evt, toggled) => this.setState({ hasNavigationToolbar: toggled })} />
            )} />
        </FormControl>
      </WizardConfigureDefaultLayout>
    )
  }
}

export default WizardConfigureGeneric
