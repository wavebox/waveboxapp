import React from 'react'
import PropTypes from 'prop-types'
import {TextField} from '@material-ui/core'
import {accountActions} from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import ACTemplatedAccount from 'shared/Models/ACAccounts/ACTemplatedAccount'
import validUrl from 'valid-url'

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
  }
}

@withStyles(styles)
class WizardPersonaliseGeneric extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
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
  // Events
  /* **************************************************************************/

  /**
  * Handles the user pressing next
  * @param account: the account template used to create the account
  */
  handleNext = (account) => {
    const { serviceUrl } = this.state

    // Url
    if (!serviceUrl) {
      this.setState({ serviceUrlError: 'Website url is required' })
      return
    } else if (!validUrl.isUri(serviceUrl)) {
      this.setState({ serviceUrlError: 'Website url is not valid' })
      return
    } else {
      this.setState({ serviceUrlError: null })
    }

    accountActions.authMailboxGroupFromTemplate(
      new ACTemplatedAccount(account.changeDataWithChangeset({
        expando: { url: serviceUrl }
      }))
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes, onRequestNext, ...passProps } = this.props
    const { serviceUrl, serviceUrlError } = this.state

    return (
      <div {...passProps}>
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
