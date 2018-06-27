import PropTypes from 'prop-types'
import React from 'react'
import { Button, Switch, Select, MenuItem, TextField, FormControlLabel, FormControl, InputLabel } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { accountActions, accountStore } from 'stores/account'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'
import validUrl from 'valid-url'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import { withStyles } from '@material-ui/core/styles'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'
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
    mailboxId: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.nameInputRef = null
    this.urlInputRef = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateState(nextProps))
    }
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
    return {
      configureDisplayFromPage: true,
      defaultWindowOpenMode: ACMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER,
      hasNavigationToolbar: true,
      restoreLastUrl: true,
      displayNameError: null,
      serviceUrlError: null,
      displayName: '',
      serviceUrl: ''
    }
  }

  /**
  * Validates the data and creates errors based on this
  * @param state: the state to validate
  * @return a dictionary of errors
  */
  validateData (state) {
    const { serviceUrl } = state
    const errors = {}

    // Url
    if (!serviceUrl) {
      errors.serviceUrlError = 'Website url is required'
    } else if (!validUrl.isUri(serviceUrl)) {
      errors.serviceUrlError = 'Website url is not valid'
    }

    return errors
  }

  /**
  * Checks to see if the data validates
  * @param state: the state to validate
  * @return true if it validates, false otherwise
  */
  doesDataValidate (state) {
    return Object.keys(this.validateData(state)).length === 0
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user pressing cancel
  * @param mailboxId: the mailbox id we're editing
  * @param onRequestCancel: the cancel call
  */
  handleCancel = (mailboxId, onRequestCancel) => {
    // The mailbox has actually already been created at this point, so remove it.
    // Ideally this shouldn't happen but because this is handled under a configuration
    // step rather than an external creation step the mailbox is created early on in
    // its lifecycle
    accountActions.removeMailbox(mailboxId)
    onRequestCancel()
  }

  /**
  * Handles the user pressing next
  * @param mailboxId: the mailbox we're editing
  * @param onRequestCancel: the cancel call
  * @return true if it validated correctly
  */
  handleFinish = (mailboxId, onRequestCancel) => {
    const errors = this.validateData(this.state)
    const hasErrors = Object.keys(errors).length !== 0
    const update = {
      displayNameError: null,
      serviceUrlError: null,
      ...errors
    }

    if (!hasErrors) {
      const {
        displayName,
        serviceUrl,
        configureDisplayFromPage,
        defaultWindowOpenMode,
        hasNavigationToolbar,
        restoreLastUrl
      } = this.state

      const serviceId = accountStore.getState().mailboxServiceIdsOfType(mailboxId, SERVICE_TYPES.CONTAINER)

      accountActions.reduceService(serviceId, GenericServiceReducer.setDisplayName, displayName)
      accountActions.reduceService(serviceId, GenericServiceReducer.setUsePageTitleAsDisplayName, configureDisplayFromPage)
      accountActions.reduceService(serviceId, GenericServiceReducer.setUsePageThemeAsColor, configureDisplayFromPage)
      accountActions.reduceService(serviceId, GenericServiceReducer.setUrl, serviceUrl)
      accountActions.reduceService(serviceId, GenericServiceReducer.setHasNavigationToolbar, hasNavigationToolbar)
      accountActions.reduceService(serviceId, GenericServiceReducer.setRestoreLastUrl, restoreLastUrl)

      accountActions.reduceMailbox(mailboxId, MailboxReducer.setDefaultWindowOpenMode, defaultWindowOpenMode)

      onRequestCancel()
      return true
    }

    this.setState(update)
    return false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, onRequestCancel, classes, ...passProps } = this.props
    const {
      configureDisplayFromPage,
      defaultWindowOpenMode,
      hasNavigationToolbar,
      restoreLastUrl,
      displayName,
      displayNameError,
      serviceUrl,
      serviceUrlError
    } = this.state
    const hasErrors = !this.doesDataValidate(this.state)

    const buttons = (
      <div>
        <Button
          className={classes.footerButton}
          disabled={hasErrors}
          onClick={() => {
            const validated = this.handleFinish(mailboxId, onRequestCancel)
            if (validated) {
              window.location.hash = `/settings/accounts/${mailboxId}`
            }
          }}>
          Account Settings
        </Button>
        <Button
          className={classes.footerButton}
          onClick={() => this.handleCancel(mailboxId, onRequestCancel)}>
          Cancel
        </Button>
        <Button
          variant='raised'
          color='primary'
          onClick={() => this.handleFinish(mailboxId, onRequestCancel)}>
          Finish
        </Button>
      </div>
    )

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailboxId}
        buttons={buttons}
        {...passProps}>
        <h2 className={classes.heading}>Configure your Account</h2>
        <div className={classes.subheading}>
          Enter the web address and the name of the website you want
          to add
        </div>
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
          onChange={(evt) => this.setState({ displayName: evt.target.value })}
          onKeyDown={(evt) => {
            if (evt.keyCode === 13) {
              this.urlInputRef.focus()
            }
          }} />
        <TextField
          inputRef={(n) => { this.urlInputRef = n }}
          fullWidth
          type='url'
          InputLabelProps={{ shrink: true }}
          placeholder='https://wavebox.io'
          label='Website Url'
          margin='normal'
          value={serviceUrl}
          error={!!serviceUrlError}
          helperText={serviceUrlError}
          onChange={(evt) => this.setState({ serviceUrl: evt.target.value })}
          onKeyDown={(evt) => {
            if (evt.keyCode === 13) {
              this.handleFinish(mailboxId, onRequestCancel)
            }
          }} />
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
