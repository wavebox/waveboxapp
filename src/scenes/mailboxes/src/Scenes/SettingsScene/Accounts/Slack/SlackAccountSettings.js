import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper } from 'material-ui'
import { Row, Col } from 'Components/Grid'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import styles from '../../CommonSettingStyles'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountSleepableSettings from '../AccountSleepableSettings'

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
            <AccountBadgeSettings mailbox={mailbox} />
            <AccountNotificationSettings mailbox={mailbox} />
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
}
