const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Paper, TextField } = require('material-ui')
const { Grid: { Row, Col } } = require('Components')
const AccountAppearanceSettings = require('../AccountAppearanceSettings')
const AccountAdvancedSettings = require('../AccountAdvancedSettings')
const styles = require('../../SettingStyles')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const AccountCustomCodeSettings = require('../AccountCustomCodeSettings')
const AccountSleepableSettings = require('../AccountSleepableSettings')
const { mailboxActions, GenericMailboxReducer, GenericDefaultServiceReducer } = require('stores/mailbox')
const validUrl = require('valid-url')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GenericAccountSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      displayNameError: null,
      serviceUrlError: null
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleNameChange (evt) {
    const value = evt.target.value
    if (!value) {
      this.setState({ displayNameError: 'Display name is required' })
    } else {
      this.setState({ displayNameError: null })
      mailboxActions.reduce(this.props.mailbox.id, GenericMailboxReducer.setDisplayName, value)
    }
  },

  handleUrlChange (evt) {
    const value = evt.target.value
    if (!value) {
      this.setState({ serviceUrlError: 'Service url is required' })
    } else if (!validUrl.isUri(value)) {
      this.setState({ serviceUrlError: 'Service url is not a valid url' })
    } else {
      this.setState({ serviceUrlError: null })
      mailboxActions.reduceService(
        this.props.mailbox.id,
        CoreMailbox.SERVICE_TYPES.DEFAULT,
        GenericDefaultServiceReducer.setUrl,
        value
      )
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { displayNameError, serviceUrlError } = this.state
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <Paper zDepth={1} style={styles.paper}>
              <TextField
                key={mailbox.displayName}
                fullWidth
                floatingLabelFixed
                hintText='My Website'
                floatingLabelText='Website Name'
                defaultValue={mailbox.displayName}
                errorText={displayNameError}
                onBlur={this.handleNameChange} />
              <TextField
                key={service.url}
                fullWidth
                type='url'
                floatingLabelFixed
                hintText='https://wavebox.io'
                floatingLabelText='Website Url'
                defaultValue={service.url}
                errorText={serviceUrlError}
                onBlur={this.handleUrlChange} />
            </Paper>
            <AccountAppearanceSettings mailbox={mailbox} />
          </Col>
          <Col md={6}>
            <Paper zDepth={1} style={styles.paper}>
              <AccountSleepableSettings mailbox={mailbox} service={service} />
              <br />
              <AccountCustomCodeSettings
                mailbox={mailbox}
                service={service}
                onRequestEditCustomCode={onRequestEditCustomCode} />
            </Paper>
            <AccountAdvancedSettings mailbox={mailbox} showRestart={showRestart} />
          </Col>
        </Row>
      </div>
    )
  }
})
