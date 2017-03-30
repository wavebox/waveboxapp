const React = require('react')
const { RaisedButton, Dialog, TextField } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const GenericDefaultService = require('shared/Models/Accounts/Generic/GenericDefaultService')
const { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } = require('stores/mailbox')
const validUrl = require('valid-url')

const styles = {
  introduction: {
    textAlign: 'center',
    padding: 12,
    fontSize: '110%',
    fontWeight: 'bold'
  }
}

const NAME_REF = 'name'
const URL_REF = 'url'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxWizardGenericConfigureScene',
  propTypes: {
    params: React.PropTypes.shape({
      mailboxId: React.PropTypes.string.isRequired
    })
  },
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.params.mailboxId !== nextProps.params.mailboxId) {
      this.replaceState(this.getInitialState(nextProps))
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    return {
      open: true,
      displayNameError: null,
      serviceUrlError: null,
      displayName: '',
      serviceUrl: ''
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user pressing next
  */
  handleNext (evt) {
    const { displayName, serviceUrl } = this.state
    let hasError = false
    const stateUpdate = {}

    // Validate
    if (!displayName) {
      hasError = true
      stateUpdate.displayNameError = 'Display name is required'
    } else {
      stateUpdate.displayNameError = null
    }
    if (!serviceUrl) {
      hasError = true
      stateUpdate.serviceUrlError = 'Website Url is required'
    } else if (!validUrl.isUri(serviceUrl)) {
      hasError = true
      stateUpdate.serviceUrlError = 'Service url is not a valid url'
    } else {
      stateUpdate.serviceUrlError = null
    }

    // Update Mailbox
    if (!hasError) {
      const mailboxId = this.props.params.mailboxId
      mailboxActions.reduce(mailboxId, GenericMailboxReducer.setDisplayName, displayName)
      mailboxActions.reduceService(mailboxId, GenericDefaultService.type, GenericDefaultServiceReducer.setUrl, serviceUrl)

      // Progress wizard
      stateUpdate.open = false
      setTimeout(() => {
        window.location.hash = '/mailbox_wizard/complete'
      }, 250)
    }
    this.setState(stateUpdate)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { open, displayName, displayNameError, serviceUrl, serviceUrlError } = this.state

    return (
      <Dialog
        open={open}
        contentStyle={{ width: '90%', maxWidth: 900 }}
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        actions={(<RaisedButton label='Next' primary onClick={this.handleNext} />)}
        autoScrollBodyContent>
        <div style={styles.introduction}>
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
                this.handleNext(evt)
              }
            }} />
        </div>
      </Dialog>
    )
  }
})
