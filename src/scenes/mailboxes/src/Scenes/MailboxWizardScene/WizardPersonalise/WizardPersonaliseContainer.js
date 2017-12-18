import React from 'react'
import PropTypes from 'prop-types'
import {TextField} from 'material-ui'
import {userStore} from 'stores/user'
import {mailboxActions} from 'stores/mailbox'

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
const SUBDOMAIN_REF = 'SUBDOMAIN_REF'

export default class WizardPersonaliseContainer extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    containerId: PropTypes.string.isRequired
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
  * @param MailboxClass: the mailbox class we're creating
  * @param accessMode: the access mode of the mailbox
  * @param mailboxJS: the provisional mailboxJS the parent has given
  */
  handleNext = (MailboxClass, accessMode, mailboxJS) => {
    const { container } = this.state
    if (container.hasUrlSubdomain) {
      const subdomain = this.refs[SUBDOMAIN_REF].input.value
      if (!subdomain) {
        this.setState({ showSubdomainError: true })
      } else {
        this.setState({ showSubdomainError: false })
        mailboxJS.urlSubdomain = subdomain
        mailboxActions.authenticateMailbox(MailboxClass, accessMode, mailboxJS)
      }
    } else {
      mailboxActions.authenticateMailbox(MailboxClass, accessMode, mailboxJS)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { container, showSubdomainError } = this.state

    const elements = []

    if (container.hasUrlSubdomain) {
      const subdomainName = container.urlSubdomainName.charAt(0).toUpperCase() + container.urlSubdomainName.slice(1)
      elements.push(
        <div key='urlSubdomain'>
          <h2 style={styles.heading}>Personalize your account</h2>
          <p style={styles.subHeading}>Setup your account so it's ready to use</p>
          <TextField
            ref={SUBDOMAIN_REF}
            floatingLabelFixed
            fullWidth
            floatingLabelText={subdomainName}
            hintText={container.urlSubdomainHint}
            errorText={showSubdomainError ? `${subdomainName} is required` : undefined} />
        </div>
      )
    }

    if (elements.length) {
      return (<div>{elements}</div>)
    } else {
      return false
    }
  }
}
