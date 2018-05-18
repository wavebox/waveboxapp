import React from 'react'
import PropTypes from 'prop-types'
import { Switch, FormControl, FormControlLabel } from 'material-ui'
import { mailboxActions, ContainerDefaultServiceReducer } from 'stores/mailbox'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import CoreService from 'shared/Models/Accounts/CoreService'
import SleepableField from 'wbui/SleepableField'
import { userStore } from 'stores/user'
import { withStyles } from 'material-ui/styles'

import red from 'material-ui/colors/red'
import amber from 'material-ui/colors/amber'

const styles = {
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  sleepContainer: {
    maxWidth: 500
  },
  warningText: {
    color: amber[700],
    fontSize: 14,
    fontWeight: 300
  },
  warningTextIcon: {
    color: amber[700],
    fontSize: 18,
    marginRight: 4,
    verticalAlign: 'top'
  },
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
class WizardConfigureContainer extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    onRequestCancel: PropTypes.func.isRequired
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

  render () {
    const { mailbox, onRequestCancel, classes, ...passProps } = this.props
    const { userHasSleepable } = this.state
    const service = mailbox.defaultService

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailbox.id}
        {...passProps}>
        <h2 className={classes.heading}>Configure your Account</h2>
        <FormControl fullWidth>
          <FormControlLabel
            label='Show navigation toolbar'
            control={(
              <Switch
                checked={service.hasNavigationToolbar}
                color='primary'
                onChange={(evt, toggled) => {
                  mailboxActions.reduceService(
                    mailbox.id,
                    CoreService.SERVICE_TYPES.DEFAULT,
                    ContainerDefaultServiceReducer.setHasNavigationToolbar,
                    toggled
                  )
                }} />
            )} />
        </FormControl>
        {service.supportsGuestNotifications ? (
          <FormControl fullWidth>
            <FormControlLabel
              label='Show Notifications'
              control={(
                <Switch
                  checked={service.showNotifications}
                  color='primary'
                  onChange={(evt, toggled) => {
                    mailboxActions.reduceService(
                      mailbox.id,
                      CoreService.SERVICE_TYPES.DEFAULT,
                      ContainerDefaultServiceReducer.setShowNotifications,
                      toggled
                    )
                  }} />
              )} />
          </FormControl>
        ) : undefined}
        <div>
          <FormControl fullWidth>
            <FormControlLabel
              label={(
                <span>
                  <span>Show unread activity in sidebar or toolbar as </span>
                  <span className={classes.mockUnreadActivityIndicator}>●</span>
                </span>
              )}
              control={(
                <Switch
                  checked={service.showUnreadActivityBadge}
                  color='primary'
                  onChange={(evt, toggled) => {
                    mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setShowUnreadActivityBadge, toggled)
                  }} />
              )} />
          </FormControl>
          <FormControl fullWidth>
            <FormControlLabel
              label={(
                <span>
                  <span>Show unread activity in Menu Bar & App Badge as </span>
                  <span className={classes.mockUnreadActivityIndicator}>●</span>
                </span>
              )}
              control={(
                <Switch
                  checked={service.unreadActivityCountsTowardsAppUnread}
                  color='primary'
                  onChange={(evt, toggled) => {
                    mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setUnreadActivityCountsTowardsAppUnread, toggled)
                  }} />
              )} />
          </FormControl>
        </div>
        {userHasSleepable ? (
          <div className={classes.sleepContainer}>
            <SleepableField
              sleepEnabled={service.sleepable}
              onSleepEnabledChanged={(toggled) => {
                mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setSleepable, toggled)
              }}
              sleepWaitMs={service.sleepableTimeout}
              onSleepWaitMsChanged={(value) => {
                mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setSleepableTimeout, value)
              }} />
          </div>
        ) : undefined}
      </WizardConfigureDefaultLayout>
    )
  }
}

export default WizardConfigureContainer
