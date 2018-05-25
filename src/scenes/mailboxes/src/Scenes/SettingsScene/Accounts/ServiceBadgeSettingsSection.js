import PropTypes from 'prop-types'
import React from 'react'
import { mailboxActions, ServiceReducer } from 'stores/mailbox'
import ColorPickerButton from 'wbui/ColorPickerButton'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import SettingsListItemText from 'wbui/SettingsListItemText'
import WarningIcon from '@material-ui/icons/Warning'
import SmsIcon from '@material-ui/icons/Sms'
import AdjustIcon from '@material-ui/icons/Adjust'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

const styles = {
  mockUnreadActivityIndicator: {
    backgroundColor: red[400],
    color: 'white',
    display: 'inline-block',
    borderRadius: '50%',
    width: 15,
    height: 15,
    lineHeight: '15px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '10px',
    paddingRight: 1
  },
  buttonIcon: {
    marginRight: 6,
    width: 18,
    height: 18
  }
}

@withStyles(styles)
class ServiceBadgeSettingsSection extends React.Component {
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
    return (
      modelCompare(this.props.mailbox, nextProps.mailbox, ['id']) ||
      modelCompare(this.props.service, nextProps.service, [
        'type',
        'sleepable',
        'supportsSyncWhenSleeping',
        'unreadBadgeColor',
        'supportsUnreadCount',
        'showUnreadBadge',
        'unreadCountsTowardsAppUnread',
        'supportsUnreadActivity',
        'showUnreadActivityBadge',
        'unreadActivityCountsTowardsAppUnread'
      ]) ||
      partialShallowCompare({}, this.state, {}, nextState)
    )
  }

  render () {
    const { mailbox, service, classes, ...passProps } = this.props
    const { userHasSleepable } = this.state
    if (ServiceBadgeSettingsSection.willRenderForService(service) === false) { return false }

    const items = [
      (userHasSleepable && service.sleepable && !service.supportsSyncWhenSleeping ? (isLast) => {
        return (
          <SettingsListItemText
            key='info'
            divider={!isLast}
            primaryType='warning'
            primaryIcon={<WarningIcon />}
            primary={(
              <span>
                Badges will only sync for this service when the account is not sleeping. To
                ensure badges are always updated we recommend disabling sleeping for this service
              </span>
            )} />
        )
      } : undefined),
      (isLast) => {
        return (
          <SettingsListItem
            key='unreadBadgeColor'
            divider={!isLast}>
            <ColorPickerButton
              buttonProps={{ variant: 'raised', size: 'small' }}
              value={service.unreadBadgeColor}
              onChange={(col) => mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadBadgeColor, col)}>
              <SmsIcon className={classes.buttonIcon} />
              Badge Color
            </ColorPickerButton>
          </SettingsListItem>
        )
      },
      (service.supportsUnreadCount ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showUnreadBadge'
            divider={!isLast}
            label='Show unread count in sidebar or toolbar'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setShowUnreadBadge, toggled)
            }}
            checked={service.showUnreadBadge} />
        )
      } : undefined),
      (service.supportsUnreadCount ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='unreadCountsTowardsAppUnread'
            divider={!isLast}
            label='Show unread count in Menu Bar & App Badge'
            onChange={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setUnreadCountsTowardsAppUnread, toggled)
            }}
            checked={service.unreadCountsTowardsAppUnread} />
        )
      } : undefined),
      (service.supportsUnreadActivity ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='showUnreadActivityBadge'
            divider={!isLast}
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
        )
      } : undefined),
      (service.supportsUnreadActivity ? (isLast) => {
        return (
          <SettingsListItemSwitch
            key='unreadActivityCountsTowardsAppUnread'
            divider={!isLast}
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
        )
      } : undefined)
    ].filter((item) => !!item).map((item, index, arr) => {
      return item(index === (arr.length - 1))
    })

    return (
      <SettingsListSection title='Badges' icon={<AdjustIcon />} {...passProps}>
        {items}
      </SettingsListSection>
    )
  }
}

export default ServiceBadgeSettingsSection
