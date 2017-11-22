import React from 'react'
import { Avatar, RaisedButton, FlatButton, FontIcon } from 'material-ui'
import { mailboxStore, mailboxActions, MailboxReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { settingsActions } from 'stores/settings'
import * as Colors from 'material-ui/styles/colors'
import Resolver from 'Runtime/Resolver'

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflowY: 'auto'
  },
  purchaseContainer: {
    border: `2px solid ${Colors.lightBlue500}`,
    borderRadius: 4,
    padding: 16,
    marginLeft: 16,
    marginRight: 16,
    display: 'block'
  },
  purchaseContainerHr: {
    border: 'none',
    height: 2,
    backgroundColor: Colors.lightBlue500,
    marginLeft: -16,
    marginRight: -16,
    marginTop: 32,
    marginBottom: 32
  },

  // Lead
  leadPane: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 0,
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 0
  },
  leadTitle: {
    fontWeight: 300,
    fontSize: 35
  },

  // Options
  optionsPane: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 0,
    marginBottom: 16,
    paddingTop: 0,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16
  },
  option: {
    position: 'relative',
    minHeight: 100,
    marginTop: 48,
    marginBottom: 48
  },
  optionImageContainer: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    width: 250,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  optionImage: {
    cursor: 'pointer'
  },
  optionBody: {
    marginLeft: 265
  },
  optionTitle: {
    fontWeight: 300,
    fontSize: 25,
    marginBottom: 0
  },
  optionDescription: {
    marginTop: 0
  }
}

export default class OptimizeWizardSleepDisplayScene extends React.Component {
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
      hasSleepable: userStore.getState().user.hasSleepable,
      isWorking: false
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      hasSleepable: userState.user.hasSleepable
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Enables the sleep indicator across all accounts
  */
  handleEnableSleepIndicator = () => {
    this._handleChangeSleepIndicatorSetting(true)
  }

  /**
  * Disables the sleep indicator across all accounts
  */
  handleDisableSleepIndicator = () => {
    this._handleChangeSleepIndicatorSetting(false)
  }

  /**
  * Changes the sleep indicator setting across all accounts
  * @param enabled: true to display the indicator, false otherwise
  */
  _handleChangeSleepIndicatorSetting = (enabled) => {
    if (this.state.isWorking) { return }
    this.setState({ isWorking: true }, () => {
      setTimeout(() => {
        // This should really be in a single reduce command, but it happens infreqently so just burn a little cpu
        mailboxStore.getState().allMailboxes().forEach((mailbox) => {
          mailboxActions.reduce(mailbox.id, MailboxReducer.setShowSleepableServiceIndicator, enabled)
        })
        settingsActions.setShowSleepableServiceIndicator.defer(enabled)
        window.location.hash = '/optimize_wizard/finish'
      }, 100)
    })
  }

  /**
  * Keeps the current settings
  */
  handleKeepSettings = () => {
    if (this.state.isWorking) { return }
    window.location.hash = '/optimize_wizard/finish'
  }

  /**
  * Opens the pro dialog
  */
  handleOpenPro = () => {
    window.location.hash = '/pro'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      hasSleepable,
      isWorking
    } = this.state

    return (
      <div style={styles.container} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
        <div style={styles.leadPane}>
          <h1 style={styles.leadTitle}>Account Sleeping</h1>
          <p>
            You can set you services to be greyed out when sleeping. This can help you quickly see what
            is and what isn't running in Wavebox. Pick whether you want to enable or disable this feature
            by choosing an option below.
          </p>
        </div>
        {hasSleepable ? (
          <div style={styles.optionsPane}>
            <div style={styles.option}>
              <div onClick={this.handleEnableSleepIndicator} style={{
                ...styles.optionImageContainer,
                backgroundImage: `url("${Resolver.image('optimize_wizard_sleep_display_indicator.png', Resolver.API_TYPES.BROWSER)}")`
              }} />
              <div style={styles.optionBody}>
                <h2 style={styles.optionTitle}>Make sleeping services appear grey</h2>
                <p style={styles.optionDescription}>
                  When a service goes to sleep it will be greyed out in your sidebar and toolbar, quickly
                  letting you know what's running in Wavebox.
                </p>
                <RaisedButton
                  primary
                  disabled={isWorking}
                  icon={isWorking ? (
                    <span>
                      <FontIcon className='fa fa-spin fa-circle-o-notch' color='rgba(0, 0, 0, 0.3)' style={{ fontSize: '20px' }} />
                    </span>
                  ) : undefined}
                  label='Make sleeping services appear grey'
                  onClick={this.handleEnableSleepIndicator} />
              </div>
            </div>
            <div style={styles.option}>
              <div onClick={this.handleDisableSleepIndicator} style={{
                ...styles.optionImageContainer,
                backgroundImage: `url("${Resolver.image('optimize_wizard_sleep_display_no_indicator.png', Resolver.API_TYPES.BROWSER)}")`
              }} />
              <div style={styles.optionBody}>
                <h2 style={styles.optionTitle}>Use the standard icon coloring</h2>
                <p style={styles.optionDescription}>
                  Services will always be displayed in full color, giving you a consistent look and feel
                  when using Wavebox.
                </p>
                <RaisedButton
                  primary
                  disabled={isWorking}
                  icon={isWorking ? (
                    <span>
                      <FontIcon className='fa fa-spin fa-circle-o-notch' color='rgba(0, 0, 0, 0.3)' style={{ fontSize: '20px' }} />
                    </span>
                  ) : undefined}
                  label={`Use the standard icon coloring`}
                  onClick={this.handleDisableSleepIndicator} />
              </div>
            </div>
            <div style={{ ...styles.option, marginBottom: 0 }}>
              <div style={styles.optionImageContainer}>
                <Avatar
                  style={styles.optionImage}
                  onClick={this.handleKeepSettings}
                  color='white'
                  backgroundColor={Colors.grey600}
                  icon={(<FontIcon className='fa fa-fw fa-tasks' />)}
                  size={100} />
              </div>
              <div style={styles.optionBody}>
                <h2 style={styles.optionTitle}>Keep my current configuration</h2>
                <p style={styles.optionDescription}>
                  Leave my configuration as it is already.
                </p>
                <RaisedButton
                  label='Keep configration'
                  disabled={isWorking}
                  onClick={this.handleKeepSettings} />
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.purchaseContainer}>
            <p>You can only pick how your sleeping services are displayed when you purchase Wavebox.</p>
            <FlatButton
              primary
              label='Purchase Wavebox'
              onClick={this.handleOpenPro} />
          </div>
        )}
      </div>
    )
  }
}
