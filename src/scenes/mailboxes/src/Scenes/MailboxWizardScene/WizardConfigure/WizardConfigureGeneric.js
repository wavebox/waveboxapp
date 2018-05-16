import PropTypes from 'prop-types'
import React from 'react'
import { Button, Switch, Select, MenuItem, TextField } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import GenericDefaultService from 'shared/Models/Accounts/Generic/GenericDefaultService'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
import validUrl from 'valid-url'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import { withStyles } from 'material-ui/styles'

const humanizedOpenModes = {
  [CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER]: 'Default Browser',
  [CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX]: 'Wavebox Browser'
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

export default class WizardConfigureGeneric extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
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
    if (this.props.mailbox.id !== nextProps.mailbox.id) {
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
      defaultWindowOpenMode: CoreMailbox.DEFAULT_WINDOW_OPEN_MODES.BROWSER,
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
    const { displayName, serviceUrl } = state
    const errors = {}

    // Display name
    if (!displayName) {
      errors.displayNameError = 'Display name is required'
    }

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
  * @param mailbox: the mailbox we're editing
  * @param onRequestCancel: the cancel call
  */
  handleCancel = (mailbox, onRequestCancel) => {
    // The mailbox has actually already been created at this point, so remove it.
    // Ideally this shouldn't happen but because this is handled under a configuration
    // step rather than an external creation step the mailbox is created early on in
    // its lifecycle
    mailboxActions.remove(mailbox.id)
    onRequestCancel()
  }

  /**
  * Handles the user pressing next
  * @param mailbox: the mailbox we're editing
  * @param onRequestCancel: the cancel call
  * @return true if it validated correctly
  */
  handleFinish = (mailbox, onRequestCancel) => {
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

      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setDisplayName, displayName)
      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageTitleAsDisplayName, configureDisplayFromPage)
      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageThemeAsColor, configureDisplayFromPage)
      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setDefaultWindowOpenMode, defaultWindowOpenMode)
      mailboxActions.reduceService(mailbox.id, GenericDefaultService.type, GenericDefaultServiceReducer.setUrl, serviceUrl)
      mailboxActions.reduceService(mailbox.id, GenericDefaultService.type, GenericDefaultServiceReducer.setHasNavigationToolbar, hasNavigationToolbar)
      mailboxActions.reduceService(mailbox.id, GenericDefaultService.type, GenericDefaultServiceReducer.setRestoreLastUrl, restoreLastUrl)
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
    const { mailbox, onRequestCancel, classes, ...passProps } = this.props
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
            const validated = this.handleFinish(mailbox, onRequestCancel)
            if (validated) {
              window.location.hash = `/settings/accounts/${mailbox.id}`
            }
          }}>
          Account Settings
        </Button>
        <Button
          className={classes.footerButton}
          onClick={() => this.handleCancel(mailbox, onRequestCancel)}>
          Cancel
        </Button>
        <Button
          variant='raised'
          color='primary'
          onClick={() => this.handleFinish(mailbox, onRequestCancel)}>
          Finish
        </Button>
      </div>
    )

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailbox.id}
        buttons={buttons}
        {...passProps}>
        <h2 className={classes.heading}>Configure your Account</h2>
        <div className={classes.subheading}>
          Enter the web address and the name of the website you want
          to add
        </div>
        <div>
          <TextField
            inputRef={(n) => { this.nameInputRef = n }}
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder='My Website'
            label='Website Name'
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
            value={serviceUrl}
            error={!!serviceUrlError}
            helperText={serviceUrlError}
            onChange={(evt) => this.setState({ serviceUrl: evt.target.value })}
            onKeyDown={(evt) => {
              if (evt.keyCode === 13) {
                this.handleFinish(mailbox, onRequestCancel)
              }
            }} />
        </div>
        <Select
          label='Open new windows in which Browser'
          value={defaultWindowOpenMode}
          fullWidth
          onChange={(evt) => {
            this.setState({ defaultWindowOpenMode: evt.target.value })
          }}>
          {Object.keys(CoreMailbox.DEFAULT_WINDOW_OPEN_MODES).map((mode) => {
            return (<MenuItem key={mode} value={mode}>{humanizedOpenModes[mode]}</MenuItem>)
          })}
        </Select>
        <br />
        <Switch
          checked={restoreLastUrl}
          color='primary'
          label='Restore last page on load'
          labelPosition='right'
          onChange={(evt, toggled) => { this.setState({ restoreLastUrl: toggled }) }} />
        <Switch
          checked={configureDisplayFromPage}
          color='primary'
          label='Use Page Title & Theme to customise icon appearance'
          labelPosition='right'
          onChange={(evt, toggled) => this.setState({ configureDisplayFromPage: toggled })} />
        <Switch
          checked={hasNavigationToolbar}
          color='primary'
          label='Show navigation toolbar'
          labelPosition='right'
          onChange={(evt, toggled) => this.setState({ hasNavigationToolbar: toggled })} />
      </WizardConfigureDefaultLayout>
    )
  }
}
