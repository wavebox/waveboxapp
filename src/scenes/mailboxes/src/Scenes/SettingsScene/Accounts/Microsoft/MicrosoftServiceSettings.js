const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const AccountServiceItem = require('../AccountServiceItem')
const { Grid: { Row, Col } } = require('Components')
const AccountCustomCodeSettings = require('../AccountCustomCodeSettings')
const AccountSleepableSettings = require('../AccountSleepableSettings')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MicrosoftServiceSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    serviceType: React.PropTypes.string.isRequired,
    onRequestEditCustomCode: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailbox, serviceType, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(serviceType)

    return (
      <AccountServiceItem {...passProps} mailbox={mailbox} serviceType={serviceType}>
        {service ? (
          <Row>
            <Col md={6}>
              <AccountSleepableSettings mailbox={mailbox} service={service} />
              <br />
              <AccountCustomCodeSettings
                mailbox={mailbox}
                service={service}
                onRequestEditCustomCode={onRequestEditCustomCode} />
            </Col>
          </Row>
        ) : undefined}
      </AccountServiceItem>
    )
  }
})
