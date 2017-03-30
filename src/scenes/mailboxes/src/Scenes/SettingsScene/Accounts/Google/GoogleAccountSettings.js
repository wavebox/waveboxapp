const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Grid: { Row, Col } } = require('Components')
const AccountAppearanceSettings = require('../AccountAppearanceSettings')
const AccountAdvancedSettings = require('../AccountAdvancedSettings')
const AccountNotificationBadgeSettings = require('../AccountNotificationBadgeSettings')
const CoreService = require('shared/Models/Accounts/CoreService')
const ServiceFactory = require('shared/Models/Accounts/ServiceFactory')
const { userStore } = require('stores/user')
const { RaisedButton, Avatar, FontIcon } = require('material-ui')

const GoogleDefaultServiceSettings = require('./GoogleDefaultServiceSettings')
const GoogleServiceSettings = require('./GoogleServiceSettings')

const styles = {
  proServices: {
    textAlign: 'center'
  },
  proServiceAvatars: {
    marginTop: 8,
    marginBottom: 8
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleAccountSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired,
    onRequestEditCustomCode: React.PropTypes.func.isRequired
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
  // UI Events
  /* **************************************************************************/

  /**
  * Opens wavebox pro
  */
  openWaveboxPro () {
    window.location.hash = '/pro'
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
    switch (serviceType) {
      case CoreService.SERVICE_TYPES.DEFAULT:
        return (
          <GoogleDefaultServiceSettings
            key={serviceType}
            mailbox={mailbox}
            onRequestEditCustomCode={onRequestEditCustomCode} />)
      default:
        return (
          <GoogleServiceSettings
            key={serviceType}
            mailbox={mailbox}
            serviceType={serviceType}
            onRequestEditCustomCode={onRequestEditCustomCode} />)
    }
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
            <div style={styles.proServices}>
              <h3>Enjoy all these extra services with Wavebox Pro...</h3>
              <div style={styles.proServiceAvatars}>
                {mailbox.supportedServiceTypes.map((serviceType) => {
                  if (serviceType === CoreService.SERVICE_TYPES.DEFAULT) { return undefined }
                  const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)
                  return (
                    <Avatar
                      key={serviceType}
                      size={40}
                      src={'../../' + serviceClass.humanizedLogo}
                      backgroundColor='white'
                      style={{ marginRight: 8, border: '2px solid rgb(139, 139, 139)' }} />)
                })}
              </div>
              <RaisedButton
                primary
                icon={(<FontIcon className='fa fa-diamond' />)}
                label='Wavebox Pro'
                onClick={this.openWaveboxPro} />
            </div>
          </div>
        )}
      </div>
    )
  }
})
