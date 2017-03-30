const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Grid: { Row, Col } } = require('Components')
const AccountAppearanceSettings = require('../AccountAppearanceSettings')
const AccountAdvancedSettings = require('../AccountAdvancedSettings')
const AccountNotificationBadgeSettings = require('../AccountNotificationBadgeSettings')
const MicrosoftServiceSettings = require('./MicrosoftServiceSettings')
const { userStore } = require('stores/user')
const CoreService = require('shared/Models/Accounts/CoreService')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MicrosoftAccountSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  },

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      userHasServices: userStore.getState().user.hasServices
    }
  },

  userUpdated (userState) {
    this.setState({
      userHasServices: userState.user.hasServices
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the service type
  * @param mailbox: the current mailbox
  * @param serviceType: the type of service we are rendering for
  * @param onRequestEditCustomCode: the function call to open the edit custom code modal
  * @return jsx
  */
  renderServiceType (mailbox, serviceType, onRequestEditCustomCode) {
    return (
      <MicrosoftServiceSettings
        key={serviceType}
        mailbox={mailbox}
        serviceType={serviceType}
        onRequestEditCustomCode={onRequestEditCustomCode} />)
  },

  render () {
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const { userHasServices } = this.state

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <AccountAppearanceSettings mailbox={mailbox} />
            <AccountNotificationBadgeSettings mailbox={mailbox} />
          </Col>
          <Col md={6}>
            <AccountAdvancedSettings mailbox={mailbox} showRestart={showRestart} />
          </Col>
        </Row>
        {userHasServices ? (
          <div>
            {mailbox.enabledServiceTypes.map((serviceType) => {
              return this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode)
            })}
            {mailbox.disabledServiceTypes.map((serviceType) => {
              return this.renderServiceType(mailbox, serviceType, onRequestEditCustomCode)
            })}
          </div>
        ) : (
          <div>
            {this.renderServiceType(mailbox, CoreService.SERVICE_TYPES.DEFAULT, onRequestEditCustomCode)}
          </div>
        )}
      </div>
    )
  }
})
