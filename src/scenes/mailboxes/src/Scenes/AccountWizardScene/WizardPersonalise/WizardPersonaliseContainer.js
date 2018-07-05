import React from 'react'
import PropTypes from 'prop-types'
import {TextField} from '@material-ui/core'
import {userStore} from 'stores/user'
import {accountActions} from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import ACTemplatedAccount from 'shared/Models/ACAccounts/ACTemplatedAccount'

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
class WizardPersonaliseContainer extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    containerId: PropTypes.string.isRequired
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
    if (this.props.containerId !== nextProps.containerId) {
      this.setState({
        container: userStore.getState().getContainer(nextProps.containerId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      container: userStore.getState().getContainer(this.props.containerId),
      showSubdomainError: false
    }
  })()

  userStoreChanged = (userState) => {
    this.setState({
      container: userState.getContainer(this.props.containerId)
    })
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the user pressing next
  * @param account: the account template used to create the account
  */
  handleNext = (account) => {
    const { container } = this.state
    const changeset = {
      displayName: container.name
    }

    if (container.hasUrlSubdomain) {
      const subdomain = this.subdomainInputRef.value
      if (!subdomain) {
        this.setState({ showSubdomainError: true })
        return
      } else {
        this.setState({ showSubdomainError: false })
        changeset.expando = { urlSubdomain: subdomain }
      }
    }

    accountActions.authMailboxGroupFromTemplate(
      new ACTemplatedAccount(account.changeDataWithChangeset(changeset))
    )
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { container, showSubdomainError } = this.state
    const { classes, ...passProps } = this.props

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
