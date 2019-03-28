import React from 'react'
import PropTypes from 'prop-types'
import { TextField, FormControlLabel, Checkbox } from '@material-ui/core'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import ACTemplatedAccount from 'shared/Models/ACAccounts/ACTemplatedAccount'
import validUrl from 'valid-url'

const styles = {
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  subHeading: {
    fontWeight: 300,
    marginTop: -10,
    fontSize: 16
  }
}

@withStyles(styles)
class WizardPersonaliseContainer extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    accessMode: PropTypes.string.isRequired,
    onRequestNext: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userStoreChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userStoreChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.accessMode !== nextProps.accessMode) {
      this.setState({
        container: userStore.getState().getContainer(nextProps.accessMode),
        ...this.generateFreshEditState()
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    container: userStore.getState().getContainer(this.props.accessMode),
    ...this.generateFreshEditState()
  }

  /**
  * @return new editing state
  */
  generateFreshEditState () {
    return {
      subdomainValue: '',
      subdomainHasError: false,

      urlOverwriteEnabled: false,
      urlOverwriteValue: '',
      urlOverwriteHasError: false
    }
  }

  userStoreChanged = (userState) => {
    this.setState({
      container: userState.getContainer(this.props.accessMode)
    })
  }

  /* **************************************************************************/
  // Validate
  /* **************************************************************************/

  /**
  * Auto-prefix the url with https:// if the user hasn't
  * @param url: the url to autoprefix
  * @return an autoprefixed url
  */
  autoPrefixUrl (url) {
    return url.indexOf('://') === -1 ? `https://${url}` : url
  }

  /**
  * Validates and updates the current state
  * @return true if validation is okay, false otherwise
  */
  validateState () {
    const {
      container,
      subdomainValue,
      urlOverwriteEnabled,
      urlOverwriteValue
    } = this.state

    let hasError = false
    const delta = {}

    if (container.urlCanBeOverwritten) {
      if (urlOverwriteEnabled) {
        if (!urlOverwriteValue) {
          hasError = true
          delta.urlOverwriteHasError = true
        } else if (!validUrl.isUri(this.autoPrefixUrl(urlOverwriteValue))) {
          hasError = true
          delta.urlOverwriteHasError = true
        } else {
          delta.urlOverwriteHasError = false
        }
      } else {
        delta.urlOverwriteHasError = false
      }
    } else if (container.hasUrlSubdomain) {
      if (!subdomainValue) {
        delta.subdomainHasError = true
        hasError = true
      } else {
        delta.subdomainHasError = false
      }
    }

    this.setState(delta)
    return !hasError
  }

  /**
  * Gets the expando config from the state. Note doesn't validate the state
  * @param validState: the valid state to use
  * @return the model expando
  */
  getServiceExpandoFromValidState (validState) {
    const {
      container,
      subdomainValue,
      urlOverwriteEnabled,
      urlOverwriteValue
    } = validState

    const expando = {
      urlOverwrite: undefined,
      urlSubdomain: undefined
    }

    if (container.urlCanBeOverwritten) {
      if (urlOverwriteEnabled) {
        expando.urlOverwrite = this.autoPrefixUrl(urlOverwriteValue)
      }
    } else if (container.hasUrlSubdomain) {
      expando.urlSubdomain = subdomainValue
    }

    return expando
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * @public
  * Updates a templated account
  * @param account: the account tempalte to update
  * @return { ok: true|false, account }
  */
  updateTemplatedAccount (account) {
    const isValid = this.validateState()
    if (isValid) {
      return {
        ok: true,
        account: new ACTemplatedAccount(account.changeDataWithChangeset({
          displayName: this.state.container.name,
          expando: this.getServiceExpandoFromValidState(this.state)
        }))
      }
    } else {
      return { ok: false }
    }
  }

  /**
  * @public
  * Updates an attaching service
  * @param serviceJS: the serviceJS to update
  * @return { ok: true|false, serviceJS }
  */
  updateAttachingService (serviceJS) {
    const isValid = this.validateState()

    if (isValid) {
      const {
        container
      } = this.state

      return {
        ok: true,
        serviceJS: {
          ...serviceJS,
          displayName: container.name,
          ...this.getServiceExpandoFromValidState(this.state)
        }
      }
    } else {
      return { ok: false }
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the subdomain changing
  * @param evt: the event that fired
  */
  handleSudomainChange = (evt) => {
    this.setState({
      subdomainHasError: false,
      subdomainValue: evt.target.value
    })
  }

  /**
  * Handles the url overwrite changing
  * @param evt: the event that fired
  * @param toggled: the new toggled state
  */
  handleUrlOverwriteToggle = (evt, toggled) => {
    this.setState({
      urlOverwriteHasError: false,
      urlOverwriteEnabled: toggled
    })
  }

  /**
  * Handles the url overwrite changing
  * @param evt: the event that fired
  */
  handleUrlOverwriteChange = (evt) => {
    this.setState({
      urlOverwriteValue: evt.target.value,
      urlOverwriteHasError: false
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      classes,
      accessMode,
      onRequestNext,
      ...passProps
    } = this.props
    const {
      container,
      subdomainValue,
      subdomainHasError,
      urlOverwriteEnabled,
      urlOverwriteValue,
      urlOverwriteHasError
    } = this.state

    let hasContent = false
    let heading
    let content

    if (container.hasUrlSubdomain || container.urlCanBeOverwritten) {
      hasContent = true
      heading = (
        <React.Fragment>
          <h2 className={classes.heading}>Personalize your account</h2>
          <p className={classes.subHeading}>Setup your account so it's ready to use</p>
        </React.Fragment>
      )
      if (container.urlCanBeOverwritten) {
        content = (
          <React.Fragment>
            <FormControlLabel
              control={
                <Checkbox
                  checked={urlOverwriteEnabled}
                  color='primary'
                  onChange={this.handleUrlOverwriteToggle}
                />
              }
              label='Use a custom or hosted url'
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={urlOverwriteValue}
              onChange={this.handleUrlOverwriteChange}
              disabled={!urlOverwriteEnabled}
              placeholder={container.url}
              error={urlOverwriteHasError}
              helperText={urlOverwriteHasError ? `Invalid url` : undefined} />
          </React.Fragment>
        )
      } else if (container.hasUrlSubdomain) {
        const subdomainName = container.urlSubdomainName.charAt(0).toUpperCase() + container.urlSubdomainName.slice(1)
        content = (
          <React.Fragment>
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={subdomainValue}
              label={subdomainName}
              placeholder={container.urlSubdomainHint}
              onChange={this.handleSudomainChange}
              error={subdomainHasError}
              helperText={subdomainHasError ? `${subdomainName} is required` : undefined} />
          </React.Fragment>
        )
      }
    }

    if (hasContent) {
      return (
        <div {...passProps}>
          {heading}
          {content}
        </div>)
    } else {
      return false
    }
  }
}

export default WizardPersonaliseContainer
