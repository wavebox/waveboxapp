import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, FontIcon } from 'material-ui'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import commonStyles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import * as Colors from 'material-ui/styles/colors'
import { ColorPickerButton } from 'Components'
import { userStore } from 'stores/user'

const styles = {
  mockUnreadActivityIndicator: {
    backgroundColor: Colors.red400,
    color: 'white',
    display: 'inline-block',
    borderRadius: '50%',
    width: 15,
    height: 15,
    lineHeight: '14px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '10px',
    paddingRight: 1
  }
}

export default class AccountBadgeSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * @param service: the service to test with
  * @return true if these settings will render for the service
  */
  static willRenderForService (service) {
    return [
      service.supportsUnreadCount,
      service.supportsUnreadActivity
    ].findIndex((f) => f) !== -1
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    service: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      userHasSleepable: userStore.getState().user.hasSleepable
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, service, ...passProps } = this.props
    const { userHasSleepable } = this.state
    if (AccountBadgeSettings.willRenderForService(service) === false) { return false }

    return (
      <Paper zDepth={1} style={commonStyles.paper} {...passProps}>
        <h1 style={commonStyles.subheading}>Badges</h1>
        {userHasSleepable && service.sleepable && !service.supportsSyncWhenSleeping ? (
          <p style={commonStyles.warningText}>
            <FontIcon className='material-icons' style={commonStyles.warningTextIcon}>warning</FontIcon>
            Badges will only sync for this service when the account is not sleeping. To
            ensure badges are always updated we recommend disabling sleeping for this service
          </p>
        ) : undefined}
        <div style={commonStyles.button}>
          <ColorPickerButton
            label='Badge Color'
            icon={<FontIcon className='material-icons'>sms</FontIcon>}
            value={service.unreadBadgeColor}
            onChange={(col) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadBadgeColor, col)
            }} />
        </div>
        {service.supportsUnreadCount ? (
          <div>
            <Toggle
              toggled={service.showUnreadBadge}
              label='Show unread count in sidebar or toolbar'
              labelPosition='right'
              onToggle={(evt, toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowUnreadBadge, toggled)
              }} />
            <Toggle
              toggled={service.unreadCountsTowardsAppUnread}
              label='Show unread count in Menu Bar & App Badge'
              labelPosition='right'
              onToggle={(evt, toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadCountsTowardsAppUnread, toggled)
              }} />
          </div>
        ) : undefined}
        {service.supportsUnreadActivity ? (
          <div>
            <Toggle
              toggled={service.showUnreadActivityBadge}
              label={(
                <span>
                  <span>Show unread activity in sidebar or toolbar as </span>
                  <span style={styles.mockUnreadActivityIndicator}>●</span>
                </span>
              )}
              labelPosition='right'
              onToggle={(evt, toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowUnreadActivityBadge, toggled)
              }} />
            <Toggle
              toggled={service.unreadActivityCountsTowardsAppUnread}
              label={(
                <span>
                  <span>Show unread activity in Menu Bar & App Badge as </span>
                  <span style={styles.mockUnreadActivityIndicator}>●</span>
                </span>
              )}
              labelPosition='right'
              onToggle={(evt, toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadActivityCountsTowardsAppUnread, toggled)
              }} />
          </div>
        ) : undefined}
      </Paper>
    )
  }
}
