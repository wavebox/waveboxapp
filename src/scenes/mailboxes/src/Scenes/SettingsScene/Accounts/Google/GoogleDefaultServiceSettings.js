import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { SelectField, MenuItem, TextField, RaisedButton, Paper, FontIcon } from 'material-ui'
import AccountServiceItem from '../AccountServiceItem'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import { Row, Col } from 'Components/Grid'
import AccountCustomCodeSettings from '../AccountCustomCodeSettings'
import AccountSleepableSettings from '../AccountSleepableSettings'
import styles from '../../CommonSettingStyles'

export default class GoogleDefaultServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    const service = nextProps.mailbox.serviceForType(GoogleDefaultService.SERVICE_TYPES.DEFAULT)

    if (this.props.mailbox.id !== nextProps.mailbox.id) {
      this.setState({
        customUnreadQuery: service.customUnreadQuery,
        customUnreadLabelWatchString: service.customUnreadLabelWatchString,
        showCustomUnreadSettings: service.hasCustomUnreadQuery || service.hasCustomUnreadLabelWatch
      })
    } else {
      const update = {}
      if (service.customUnreadQuery !== this.state.customUnreadQuery) {
        update.customUnreadQuery = service.customUnreadQuery
      }
      if (service.customUnreadLabelWatchString !== this.state.customUnreadLabelWatchString) {
        update.customUnreadLabelWatchString = service.customUnreadLabelWatchString
      }
      if (Object.keys(update).length) {
        this.setState(update)
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const service = this.props.mailbox.serviceForType(GoogleDefaultService.SERVICE_TYPES.DEFAULT)
    return {
      customUnreadQuery: service.customUnreadQuery,
      customUnreadLabelWatchString: service.customUnreadLabelWatchString,
      showCustomUnreadSettings: service.hasCustomUnreadQuery || service.hasCustomUnreadLabelWatch
    }
  })()

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
    const {
      customUnreadQuery,
      customUnreadLabelWatchString,
      showCustomUnreadSettings
    } = this.state

    const serviceType = GoogleDefaultService.SERVICE_TYPES.DEFAULT
    const service = mailbox.serviceForType(serviceType)
    const hasCustomConfiguration = service.hasCustomUnreadQuery || service.hasCustomUnreadLabelWatch

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
            {showCustomUnreadSettings ? (
              <Paper style={styles.paper}>
                <h1 style={styles.subheading}>Advanced Unread Options</h1>
                <TextField
                  key={`customUnreadQuery_${mailbox.id}`}
                  id={`customUnreadQuery_${mailbox.id}`}
                  value={customUnreadQuery}
                  fullWidth
                  floatingLabelText='Custom Unread Query'
                  hintText='label:inbox label:unread'
                  errorText={hasCustomConfiguration && !customUnreadQuery ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
                  onChange={(evt) => this.setState({ customUnreadQuery: evt.target.value })}
                  onBlur={(evt) => {
                    mailboxActions.reduceService(mailbox.id, serviceType, GoogleDefaultServiceReducer.setCustomUnreadQuery, customUnreadQuery)
                  }} />
                <TextField
                  key={`customUnreadWatchLabels_${mailbox.id}`}
                  id={`customUnreadWatchLabels_${mailbox.id}`}
                  value={customUnreadLabelWatchString}
                  fullWidth
                  floatingLabelText='Custom Unread Watch Labels (Comma seperated)'
                  hintText='INBOX, UNREAD'
                  errorText={hasCustomConfiguration && !customUnreadLabelWatchString ? 'This must be configured. Failing to do so may have unexpected side effects' : undefined}
                  onChange={(evt) => this.setState({ customUnreadLabelWatchString: evt.target.value })}
                  onBlur={(evt) => {
                    mailboxActions.reduceService(mailbox.id, serviceType, GoogleDefaultServiceReducer.setCustomUnreadLabelWatchString, customUnreadLabelWatchString)
                  }} />
              </Paper>
            ) : (
              <div>
                <RaisedButton
                  label='Advanced Unread Options'
                  icon={(<FontIcon className='fa fa-fw fa-wrench' />)}
                  onTouchTap={() => this.setState({ showCustomUnreadSettings: true })} />
                <p style={styles.extraInfo}>
                  These can be used to configure Wavebox to provide Notifications and Badges for a custom set of messages
                </p>
              </div>
            )}
          </Col>
          <Col md={6}>
            <AccountCustomCodeSettings
              mailbox={mailbox}
              service={service}
              onRequestEditCustomCode={onRequestEditCustomCode} />
            <AccountSleepableSettings mailbox={mailbox} service={service} />
          </Col>
        </Row>
      </AccountServiceItem>
    )
  }
}
