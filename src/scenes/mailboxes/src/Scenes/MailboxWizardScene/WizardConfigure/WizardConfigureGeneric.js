import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, FlatButton, TextField, Toggle, SelectField, MenuItem } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import GenericDefaultService from 'shared/Models/Accounts/Generic/GenericDefaultService'
import { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } from 'stores/mailbox'
import validUrl from 'valid-url'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'

const humanizedOpenModes = {
  [GenericDefaultService.DEFAULT_WINDOW_OPEN_MODES.BROWSER]: 'Default Browser',
  [GenericDefaultService.DEFAULT_WINDOW_OPEN_MODES.WAVEBOX]: 'Wavebox Browser'
}
const NAME_REF = 'name'
const URL_REF = 'url'
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

export default class WizardConfigureGeneric extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

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
      defaultWindowOpenMode: GenericDefaultService.DEFAULT_WINDOW_OPEN_MODES.BROWSER,
      hasNavigationToolbar: true,
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
        hasNavigationToolbar
      } = this.state

      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setDisplayName, displayName)
      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageTitleAsDisplayName, configureDisplayFromPage)
      mailboxActions.reduce(mailbox.id, GenericMailboxReducer.setUsePageThemeAsColor, configureDisplayFromPage)
      mailboxActions.reduceService(mailbox.id, GenericDefaultService.type, GenericDefaultServiceReducer.setUrl, serviceUrl)
      mailboxActions.reduceService(mailbox.id, GenericDefaultService.type, GenericDefaultServiceReducer.setDefaultWindowOpenMode, defaultWindowOpenMode)
      mailboxActions.reduceService(mailbox.id, GenericDefaultService.type, GenericDefaultServiceReducer.setHasNavigationToolbar, hasNavigationToolbar)
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
    const { mailbox, onRequestCancel, ...passProps } = this.props
    const {
      configureDisplayFromPage,
      defaultWindowOpenMode,
      hasNavigationToolbar,
      displayName,
      displayNameError,
      serviceUrl,
      serviceUrlError
    } = this.state
    const hasErrors = !this.doesDataValidate(this.state)

    const buttons = (
      <div>
        <FlatButton
          style={styles.footerButton}
          disabled={hasErrors}
          onTouchTap={() => {
            const validated = this.handleFinish(mailbox, onRequestCancel)
            if (validated) {
              window.location.hash = `/settings/accounts/${mailbox.id}`
            }
          }}
          label='Account Settings' />
        <FlatButton
          style={styles.footerButton}
          onTouchTap={() => this.handleCancel(mailbox, onRequestCancel)}
          label='Cancel' />
        <RaisedButton
          onTouchTap={() => this.handleFinish(mailbox, onRequestCancel)}
          label='Finish'
          primary />
      </div>
    )

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailbox.id}
        buttons={buttons}
        {...passProps}>
        <h2 style={styles.heading}>Configure your Account</h2>
        <div style={styles.subheading}>
          Enter the web address and the name of the website you want
          to add
        </div>
        <div>
          <TextField
            ref={NAME_REF}
            fullWidth
            floatingLabelFixed
            hintText='My Website'
            floatingLabelText='Website Name'
            value={displayName}
            errorText={displayNameError}
            onChange={(evt) => this.setState({ displayName: evt.target.value })}
            onKeyDown={(evt) => {
              if (evt.keyCode === 13) {
                this.refs[URL_REF].focus()
              }
            }} />
          <TextField
            ref={URL_REF}
            fullWidth
            type='url'
            floatingLabelFixed
            hintText='https://wavebox.io'
            floatingLabelText='Website Url'
            value={serviceUrl}
            errorText={serviceUrlError}
            onChange={(evt) => this.setState({ serviceUrl: evt.target.value })}
            onKeyDown={(evt) => {
              if (evt.keyCode === 13) {
                this.handleFinish(mailbox, onRequestCancel)
              }
            }} />
        </div>
        <SelectField
          floatingLabelText='Open new windows in which Browser'
          value={defaultWindowOpenMode}
          floatingLabelFixed
          fullWidth
          onChange={(evt, index, value) => {
            this.setState({ defaultWindowOpenMode: value })
          }}>
          {Object.keys(GenericDefaultService.DEFAULT_WINDOW_OPEN_MODES).map((mode) => {
            return (<MenuItem key={mode} value={mode} primaryText={humanizedOpenModes[mode]} />)
          })}
        </SelectField>
        <br />
        <Toggle
          toggled={configureDisplayFromPage}
          label='Use Page Title & Theme to customise icon appearance'
          labelPosition='right'
          onToggle={(evt, toggled) => this.setState({ configureDisplayFromPage: toggled })} />
        <Toggle
          toggled={hasNavigationToolbar}
          label='Show navigation toolbar'
          labelPosition='right'
          onToggle={(evt, toggled) => this.setState({ hasNavigationToolbar: toggled })} />
      </WizardConfigureDefaultLayout>
    )
  }
}
