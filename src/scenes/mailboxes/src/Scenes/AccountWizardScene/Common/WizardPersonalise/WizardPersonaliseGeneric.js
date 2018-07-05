import React from 'react'
import PropTypes from 'prop-types'
import {TextField} from '@material-ui/core'
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
class WizardPersonaliseGeneric extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    accessMode: PropTypes.string.isRequired,
    onRequestNext: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.urlInputRef = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  state = {
    serviceUrl: '',
    serviceUrlError: null
  }

  /* **************************************************************************/
  // Validate
  /* **************************************************************************/

  /**
  * Validates and updates the current state
  * @return true if validation is okay, false otherwise
  */
  validateState () {
    const { serviceUrl } = this.state

    // Url
    if (!serviceUrl) {
      this.setState({ serviceUrlError: 'Website url is required' })
      return false
    } else if (!validUrl.isUri(serviceUrl)) {
      this.setState({ serviceUrlError: 'Website url is not valid' })
      return false
    } else {
      this.setState({ serviceUrlError: null })
      return true
    }
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
          expando: { url: this.state.serviceUrl }
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
      return {
        ok: true,
        serviceJS: {
          ...serviceJS,
          url: this.state.serviceUrl
        }
      }
    } else {
      return { ok: false }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes, accessMode, onRequestNext, ...passProps } = this.props
    const { serviceUrl, serviceUrlError } = this.state

    return (
      <div {...passProps}>
        <h2 className={classes.heading}>Personalize your account</h2>
        <p className={classes.subHeading}>Enter the link of the website you want to add</p>
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
            if (evt.keyCode === 13) { onRequestNext() }
          }} />
      </div>
    )
  }
}

export default WizardPersonaliseGeneric
