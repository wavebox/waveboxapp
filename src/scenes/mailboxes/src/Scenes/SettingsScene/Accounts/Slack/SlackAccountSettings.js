import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'Components/Grid'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountDestructiveSettings from '../AccountDestructiveSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'

export default class SlackAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <AccountAppearanceSettings mailbox={mailbox} />
            <AccountBadgeSettings mailbox={mailbox} service={service} />
            <AccountNotificationSettings mailbox={mailbox} service={service} />
            <AccountBehaviourSettings mailbox={mailbox} service={service} />
          </Col>
          <Col md={6}>
            <AccountCustomCodeSettings
              mailbox={mailbox}
              service={service}
              onRequestEditCustomCode={onRequestEditCustomCode} />
            <AccountAdvancedSettings mailbox={mailbox} showRestart={showRestart} />
            <AccountDestructiveSettings mailbox={mailbox} />
          </Col>
        </Row>
      </div>
    )
  }
}
