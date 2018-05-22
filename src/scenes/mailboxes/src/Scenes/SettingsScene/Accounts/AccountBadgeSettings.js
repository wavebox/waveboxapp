import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import ColorPickerButton from 'wbui/ColorPickerButton'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemText from 'wbui/SettingsListItemText'
import WarningIcon from '@material-ui/icons/Warning'
import SmsIcon from '@material-ui/icons/Sms'

const styles = {
  mockUnreadActivityIndicator: {
    backgroundColor: red[400],
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

@withStyles(styles)
class AccountBadgeSettings extends React.Component {
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
    const { mailbox, service, classes, ...passProps } = this.props
    const { userHasSleepable } = this.state
    if (AccountBadgeSettings.willRenderForService(service) === false) { return false }

    return (
      <SettingsListSection title='Badges' {...passProps}>
        {userHasSleepable && service.sleepable && !service.supportsSyncWhenSleeping ? (
          <SettingsListItemText
            primaryType='warning'
            primaryIcon={<WarningIcon />}
            primary={`When you have multiple services you can show the total unread count for those services in the sidebar, so at a glance you know what's new`} />
        ) : undefined}
        <SettingsListItem>
          <ColorPickerButton
            buttonProps={{ variant: 'raised', size: 'small' }}
            value={service.unreadBadgeColor}
            onChange={(col) => mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadBadgeColor, col)}>
            <SmsIcon className={classes.buttonIcon} />
            Badge Color
          </ColorPickerButton>
        </SettingsListItem>
        {service.supportsUnreadCount ? (
          <SettingsListItemSwitch
            label='Show unread count in sidebar or toolbar'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowUnreadBadge, toggled)
            }}
            checked={service.showUnreadBadge} />
        ) : undefined}
        {service.supportsUnreadCount ? (
          <SettingsListItemSwitch
            label='Show unread count in Menu Bar & App Badge'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadCountsTowardsAppUnread, toggled)
            }}
            checked={service.unreadCountsTowardsAppUnread} />
        ) : undefined}
        {service.supportsUnreadActivity ? (
          <SettingsListItemSwitch
            label={(
              <span>
                <span>Show unread activity in sidebar or toolbar as </span>
                <span className={classes.mockUnreadActivityIndicator}>●</span>
              </span>
            )}
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowUnreadActivityBadge, toggled)
            }}
            checked={service.showUnreadActivityBadge} />
        ) : undefined}
        {service.supportsUnreadActivity ? (
          <SettingsListItemSwitch
            label={(
              <span>
                <span>Show unread activity in Menu Bar & App Badge as </span>
                <span className={classes.mockUnreadActivityIndicator}>●</span>
              </span>
            )}
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadActivityCountsTowardsAppUnread, toggled)
            }}
            checked={service.unreadActivityCountsTowardsAppUnread} />
        ) : undefined}
      </SettingsListSection>
    )
  }
}

export default AccountBadgeSettings
