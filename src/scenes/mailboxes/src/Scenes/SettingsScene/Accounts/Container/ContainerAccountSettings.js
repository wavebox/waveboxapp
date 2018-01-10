import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, TextField } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'Components/Grid'
import AccountAppearanceSettings from '../AccountAppearanceSettings'
import AccountAdvancedSettings from '../AccountAdvancedSettings'
import AccountBadgeSettings from '../AccountBadgeSettings'
import AccountNotificationSettings from '../AccountNotificationSettings'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountBehaviourSettings from '../AccountBehaviourSettings'
import styles from '../../CommonSettingStyles'
import { mailboxActions, ContainerDefaultServiceReducer, ContainerMailboxReducer } from 'stores/mailbox'

export default class ContainerAccountSettings extends React.Component {
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
    const {
      mailbox,
      showRestart,
      onRequestEditCustomCode,
      ...passProps
    } = this.props
    const service = mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT)
    const container = mailbox.container

    return (
      <div {...passProps}>
        <Row>
          <Col md={6}>
            <Paper style={styles.paper}>
              <TextField
                key={`displayName_${mailbox.userDisplayName}`}
                fullWidth
                floatingLabelFixed
                hintText='My Account'
                floatingLabelText='Account Name'
                defaultValue={mailbox.userDisplayName}
                onBlur={(evt) => {
                  mailboxActions.reduce(this.props.mailbox.id, ContainerMailboxReducer.setDisplayName, evt.target.value)
                }} />
              <Toggle
                toggled={service.hasNavigationToolbar}
                label='Show navigation toolbar'
                labelPosition='right'
                onToggle={(evt, toggled) => {
                  mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setHasNavigationToolbar, toggled)
                }} />
              <Toggle
                toggled={service.restoreLastUrl}
                label='Restore last page on load'
                labelPosition='right'
                onToggle={(evt, toggled) => {
                  mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setRestoreLastUrl, toggled)
                }} />
            </Paper>
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
            <Paper zDepth={1} style={styles.paper}>
              <div style={{ fontSize: '85%' }}>
                <p>Container ID: {container.id}</p>
                <p>Container Version: {container.version}</p>
              </div>
            </Paper>
          </Col>
        </Row>
      </div>
    )
  }
}
