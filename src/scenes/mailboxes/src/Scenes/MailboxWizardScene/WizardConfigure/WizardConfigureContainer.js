import React from 'react'
import PropTypes from 'prop-types'
import { Toggle, FontIcon } from 'material-ui'
import { mailboxActions, ContainerDefaultServiceReducer } from 'stores/mailbox'
import * as Colors from 'material-ui/styles/colors'
import WizardConfigureDefaultLayout from './WizardConfigureDefaultLayout'
import CoreService from 'shared/Models/Accounts/CoreService'
import { SleepableField } from 'Components/Fields'
import { userStore } from 'stores/user'

const styles = {
  heading: {
    fontWeight: 300,
    marginTop: 40
  },
  sleepContainer: {
    maxWidth: 500
  },
  warningText: {
    color: Colors.amber700,
    fontSize: 14,
    fontWeight: 300
  },
  warningTextIcon: {
    color: Colors.amber700,
    fontSize: 18,
    marginRight: 4,
    verticalAlign: 'top'
  },
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

export default class WizardConfigureContainer extends React.Component {
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

  /**
  * Renders a warning label
  * @param hasWarning: true if there is a warning
  * @param hasWarningPtr: pointer to write true into if there is a warning
  * @param text: the text for the label
  * @return jsx
  */
  renderWarningLabel (hasWarning, hasWarningPtr, text) {
    if (hasWarning) { hasWarningPtr.hasWarning = true }
    return (
      <span>
        {hasWarning ? (<FontIcon className='material-icons' style={styles.warningTextIcon}>warning</FontIcon>) : undefined}
        <span>{text}</span>
      </span>
    )
  }

  render () {
    const { mailbox, onRequestCancel, ...passProps } = this.props
    const { userHasSleepable } = this.state
    const service = mailbox.defaultService

    return (
      <WizardConfigureDefaultLayout
        onRequestCancel={onRequestCancel}
        mailboxId={mailbox.id}
        {...passProps}>
        <h2 style={styles.heading}>Configure your Account</h2>
        <Toggle
          toggled={service.hasNavigationToolbar}
          label='Show navigation toolbar'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            mailboxActions.reduceService(
              mailbox.id,
              CoreService.SERVICE_TYPES.DEFAULT,
              ContainerDefaultServiceReducer.setHasNavigationToolbar,
              toggled
            )
          }} />
        {service.supportsGuestNotifications ? (
          <Toggle
            toggled={service.showNotifications}
            label='Show Notifications'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              mailboxActions.reduceService(
                mailbox.id,
                CoreService.SERVICE_TYPES.DEFAULT,
                ContainerDefaultServiceReducer.setShowNotifications,
                toggled
              )
            }} />
        ) : undefined}
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
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setShowUnreadActivityBadge, toggled)
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
              mailboxActions.reduceService(mailbox.id, service.type, ContainerDefaultServiceReducer.setUnreadActivityCountsTowardsAppUnread, toggled)
            }} />
        </div>
        {userHasSleepable ? (
          <div style={styles.sleepContainer}>
            <br />
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
