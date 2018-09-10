import React from 'react'
import PropTypes from 'prop-types'
import { Switch, FormControl, FormControlLabel } from '@material-ui/core'
import { accountActions, accountStore } from 'stores/account'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import SleepableField from 'wbui/SleepableField'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import ContainerServiceReducer from 'shared/AltStores/Account/ServiceReducers/ContainerServiceReducer'
import red from '@material-ui/core/colors/red'
import amber from '@material-ui/core/colors/amber'

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
    serviceId: PropTypes.string.isRequired,
    onRequestCancel: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState({
        service: accountState.getService(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      userHasSleepable: userStore.getState().user.hasSleepable,
      service: accountState.getService(this.props.serviceId)
    }
  })()

  accountUpdated = (accountState) => {
    this.setState({
      service: accountState.getService(this.props.serviceId)
    })
  }

  userUpdated = (userState) => {
    this.setState({
      userHasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { serviceId, onRequestCancel, classes, ...passProps } = this.props
    const { userHasSleepable, service } = this.state
    if (!service) { return false }

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        serviceId={serviceId}
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
                  accountActions.reduceService(
                    service.id,
                    ContainerServiceReducer.setHasNavigationToolbar,
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
                    accountActions.reduceService(
                      service.id,
                      ContainerServiceReducer.setShowNotifications,
                      toggled
                    )
                  }} />
              )} />
          </FormControl>
        ) : undefined}
        {service.supportsUnreadCount ? (
          <div>
            <FormControl fullWidth>
              <FormControlLabel
                label='Show unread count in sidebar or toolbar'
                control={(
                  <Switch
                    checked={service.showBadgeCount}
                    color='primary'
                    onChange={(evt, toggled) => {
                      accountActions.reduceService(
                        service.id,
                        ContainerServiceReducer.setShowBadgeCount,
                        toggled
                      )
                    }} />
                )} />
            </FormControl>
            <FormControl fullWidth>
              <FormControlLabel
                label='Show unread count in Menu Bar & App Badge'
                control={(
                  <Switch
                    checked={service.showBadgeCountInApp}
                    color='primary'
                    onChange={(evt, toggled) => {
                      accountActions.reduceService(
                        service.id,
                        ContainerServiceReducer.setShowBadgeCountInApp,
                        toggled
                      )
                    }} />
                )} />
            </FormControl>
          </div>
        ) : undefined}
        {service.supportsUnreadActivity ? (
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
                    checked={service.showBadgeActivity}
                    color='primary'
                    onChange={(evt, toggled) => {
                      accountActions.reduceService(
                        service.id,
                        ContainerServiceReducer.setShowBadgeActivity,
                        toggled
                      )
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
                    checked={service.showBadgeActivityInApp}
                    color='primary'
                    onChange={(evt, toggled) => {
                      accountActions.reduceService(
                        service.id,
                        ContainerServiceReducer.setShowBadgeActivityInApp,
                        toggled
                      )
                    }} />
                )} />
            </FormControl>
          </div>
        ) : undefined}
        {userHasSleepable ? (
          <div className={classes.sleepContainer}>
            <SleepableField
              fullWidth
              sleepEnabled={service.sleepable}
              onSleepEnabledChanged={(toggled) => {
                accountActions.reduceService(
                  service.id,
                  ContainerServiceReducer.setSleepable,
                  toggled
                )
              }}
              sleepWaitMs={service.sleepableTimeout}
              onSleepWaitMsChanged={(value) => {
                accountActions.reduceService(
                  service.id,
                  ContainerServiceReducer.setSleepableTimeout,
                  value
                )
              }} />
          </div>
        ) : undefined}
      </WizardConfigureDefaultLayout>
    )
  }
}

export default WizardConfigureContainer
