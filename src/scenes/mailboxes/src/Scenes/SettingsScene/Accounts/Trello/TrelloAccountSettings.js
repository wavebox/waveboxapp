import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, SelectField, MenuItem } from 'material-ui'
import { Row, Col } from 'Components/Grid'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import styles from '../../CommonSettingStyles'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import { mailboxActions, TrelloDefaultServiceReducer } from 'stores/mailbox'

export default class TrelloAccountSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
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
              <SelectField
                fullWidth
                floatingLabelText='Home board (opens on launch)'
                value={service.homeBoardId || 'default'}
                onChange={(evt, index, boardId) => {
                  mailboxActions.reduceService(
                    mailbox.id,
                    service.type,
                    TrelloDefaultServiceReducer.setHomeBoardId,
                    boardId === 'default' ? undefined : boardId
                  )
                }}>
                <MenuItem value={'default'} primaryText='Trello Home (Default)' />
                {Array.from(service.boards).map((board) => {
                  return (
                    <MenuItem key={board.id} value={board.id} primaryText={board.name} />
                  )
                })}
              </SelectField>
              <AccountBehaviourSettings mailbox={mailbox} service={service} />
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
