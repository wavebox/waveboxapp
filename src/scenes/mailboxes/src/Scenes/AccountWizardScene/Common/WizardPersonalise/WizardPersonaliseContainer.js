import React from 'react'
import PropTypes from 'prop-types'
import {TextField} from '@material-ui/core'
import {userStore} from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import ACTemplatedAccount from 'shared/Models/ACAccounts/ACTemplatedAccount'

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
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.subdomainInputRef = null
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
        container: userStore.getState().getContainer(nextProps.accessMode)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      container: userStore.getState().getContainer(this.props.accessMode),
      showSubdomainError: false
    }
  })()

  userStoreChanged = (userState) => {
    this.setState({
      container: userState.getContainer(this.props.accessMode)
    })
  }

  /* **************************************************************************/
  // Validate
  /* **************************************************************************/

  /**
  * Validates and updates the current state
  * @return true if validation is okay, false otherwise
  */
  validateState () {
    const { container } = this.state

    if (container.hasUrlSubdomain) {
      const subdomain = this.subdomainInputRef.value
      if (!subdomain) {
        this.setState({ showSubdomainError: true })
        return false
      } else {
        this.setState({ showSubdomainError: false })
      }
    }

    return true
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
          ...(this.state.container.hasUrlSubdomain ? {
            expando: {
              urlSubdomain: this.subdomainInputRef.value
            }
          } : {})
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
          displayName: this.state.container.name,
          urlSubdomain: this.subdomainInputRef.value
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
    const { container, showSubdomainError } = this.state
    const { classes, accessMode, onRequestNext, ...passProps } = this.props

    const elements = []

    if (container.hasUrlSubdomain) {
      const subdomainName = container.urlSubdomainName.charAt(0).toUpperCase() + container.urlSubdomainName.slice(1)
      elements.push(
        <div key='urlSubdomain'>
          <h2 className={classes.heading}>Personalize your account</h2>
          <p className={classes.subHeading}>Setup your account so it's ready to use</p>
          <TextField
            inputRef={(n) => { this.subdomainInputRef = n }}
            InputLabelProps={{shrink: true}}
            fullWidth
            label={subdomainName}
            placeholder={container.urlSubdomainHint}
            error={showSubdomainError}
            helperText={showSubdomainError ? `${subdomainName} is required` : undefined} />
        </div>
      )
    }

    if (elements.length) {
      return (<div {...passProps}>{elements}</div>)
    } else {
      return false
    }
  }
}

export default WizardPersonaliseContainer
