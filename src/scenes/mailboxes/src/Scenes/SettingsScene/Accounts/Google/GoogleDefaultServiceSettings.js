const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { SelectField, MenuItem } = require('material-ui')
const AccountServiceItem = require('../AccountServiceItem')
const GoogleDefaultService = require('shared/Models/Accounts/Google/GoogleDefaultService')
const { mailboxActions, GoogleDefaultServiceReducer } = require('stores/mailbox')
const { Grid: { Row, Col } } = require('Components')
const AccountCustomCodeSettings = require('../AccountCustomCodeSettings')
const AccountSleepableSettings = require('../AccountSleepableSettings')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleDefaultServiceSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    onRequestEditCustomCode: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Turns an unread mode into a friendlier string
  * @param mode: the unread mode
  * @return the humanized version
  */
  humanizeUnreadMode (mode) {
    switch (mode) {
      case GoogleDefaultService.UNREAD_MODES.INBOX_ALL:
        return 'All Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return 'Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return 'Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED:
        return 'Unread Unbundled Messages'
    }
  },

  render () {
    const { mailbox, onRequestEditCustomCode, ...passProps } = this.props
    const serviceType = GoogleDefaultService.SERVICE_TYPES.DEFAULT
    const service = mailbox.serviceForType(serviceType)

    return (
      <AccountServiceItem {...passProps} mailbox={mailbox} serviceType={serviceType}>
        <Row>
          <Col md={6}>
            <SelectField
              fullWidth
              floatingLabelText='Unread Mode'
              value={service.unreadMode}
              onChange={(evt, index, unreadMode) => {
                mailboxActions.reduceService(mailbox.id, serviceType, GoogleDefaultServiceReducer.setUnreadMode, unreadMode)
              }}>
              {Array.from(service.supportedUnreadModes).map((mode) => {
                return (
                  <MenuItem
                    key={mode}
                    value={mode}
                    primaryText={this.humanizeUnreadMode(mode)} />
                )
              })}
            </SelectField>
            <AccountCustomCodeSettings
              mailbox={mailbox}
              service={service}
              onRequestEditCustomCode={onRequestEditCustomCode} />
          </Col>
          <Col md={6}>
            <AccountSleepableSettings mailbox={mailbox} service={service} />
          </Col>
        </Row>
      </AccountServiceItem>
    )
  }
})
