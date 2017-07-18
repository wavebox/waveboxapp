import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { SelectField, MenuItem } from 'material-ui'
import AccountServiceItem from '../AccountServiceItem'
import MicrosoftDefaultService from 'shared/Models/Accounts/Microsoft/MicrosoftDefaultService'
import { mailboxActions, MicrosoftDefaultServiceReducer } from 'stores/mailbox'
import { Row, Col } from 'Components/Grid'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountSleepableSettings from '../AccountSleepableSettings'

export default class MicrosoftDefaultServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Turns an unread mode into a friendlier string
  * @param mode: the unread mode
  * @return the humanized version
  */
  humanizeUnreadMode (mode) {
    switch (mode) {
      case MicrosoftDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case MicrosoftDefaultService.UNREAD_MODES.INBOX_FOCUSED_UNREAD:
        return 'Unread Focused Messages'
    }
  }

  render () {
    const { mailbox, onRequestEditCustomCode, ...passProps } = this.props
    const serviceType = MicrosoftDefaultService.SERVICE_TYPES.DEFAULT
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
                mailboxActions.reduceService(mailbox.id, serviceType, MicrosoftDefaultServiceReducer.setUnreadMode, unreadMode)
              }}>
              {Object.keys(MicrosoftDefaultService.UNREAD_MODES).map((mode) => {
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
}
