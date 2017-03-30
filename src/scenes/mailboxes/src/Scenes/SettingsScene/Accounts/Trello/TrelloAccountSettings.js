const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Paper } = require('material-ui')
const { Grid: { Row, Col } } = require('Components')
const AccountAppearanceSettings = require('../AccountAppearanceSettings')
const AccountAdvancedSettings = require('../AccountAdvancedSettings')
const AccountNotificationBadgeSettings = require('../AccountNotificationBadgeSettings')
const styles = require('../../SettingStyles')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const AccountCustomCodeSettings = require('../AccountCustomCodeSettings')
const AccountSleepableSettings = require('../AccountSleepableSettings')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'TrelloAccountSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <AccountAppearanceSettings mailbox={mailbox} />
            <AccountNotificationBadgeSettings mailbox={mailbox} />
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
