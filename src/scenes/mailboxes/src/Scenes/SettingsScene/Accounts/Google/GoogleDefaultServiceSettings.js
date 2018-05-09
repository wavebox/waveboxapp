import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { SelectField, MenuItem, Paper } from 'material-ui'
import AccountServiceItem from '../AccountServiceItem'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import { Row, Col } from 'Components/Grid'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import styles from '../../CommonSettingStyles'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import GoogleCustomUnreadSettings from './GoogleCustomUnreadSettings'

export default class GoogleDefaultServiceSettings extends React.Component {
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
      case GoogleDefaultService.UNREAD_MODES.INBOX_ALL:
        return 'All Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD:
        return 'Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT:
        return 'Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL:
        return 'Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_ATOM:
        return '(Experimental) Unread Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_IMPORTANT_ATOM:
        return '(Experimental) Unread Important Messages'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_PERSONAL_ATOM:
        return '(Experimental) Unread Messages in Primary Category'
      case GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED:
        return 'Unread Unbundled Messages'
    }
  }

  render () {
    const {
      mailbox,
      onRequestEditCustomCode,
      ...passProps
    } = this.props

    const serviceType = GoogleDefaultService.SERVICE_TYPES.DEFAULT
    const service = mailbox.serviceForType(serviceType)

    return (
      <AccountServiceItem {...passProps} mailbox={mailbox} serviceType={serviceType}>
        <Row>
          <Col md={6}>
            <Paper zDepth={1} style={styles.paper}>
              <h1 style={styles.subheading}>Unread & Sync</h1>
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
              <GoogleCustomUnreadSettings mailbox={mailbox} service={service} />
            </Paper>
            <AccountBadgeSettings mailbox={mailbox} service={service} />
            <AccountNotificationSettings mailbox={mailbox} service={service} />
          </Col>
          <Col md={6}>
            <AccountBehaviourSettings mailbox={mailbox} service={service} />
            <AccountCustomCodeSettings
              mailbox={mailbox}
              service={service}
              onRequestEditCustomCode={onRequestEditCustomCode} />
          </Col>
        </Row>
      </AccountServiceItem>
    )
  }
}
