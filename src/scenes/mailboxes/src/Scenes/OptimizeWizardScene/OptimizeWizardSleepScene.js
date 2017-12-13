import React from 'react'
import { Avatar, RaisedButton, FlatButton, FontIcon } from 'material-ui'
import { mailboxStore, mailboxActions, ServiceReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import * as Colors from 'material-ui/styles/colors'
import CoreService from 'shared/Models/Accounts/CoreService'

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
  optionAvatarContainer: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    width: 130
  },
  optionAvatar: {
    cursor: 'pointer'
  },
  optionBody: {
    marginLeft: 130
  },
  optionDescription: {
    marginTop: 0
  }
}

export default class OptimizeWizardSleepScene extends React.Component {
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
      isOptimizing: false
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
  * Automatically optimizes the settings
  */
  handleAutoOptimizeSettings = () => {
    if (this.state.isOptimizing) { return }
    this.setState({ isOptimizing: true }, () => {
      setTimeout(() => {
        // This should really be in a single reduce command, but it happens infreqently so just burn a little cpu
        mailboxStore.getState().allMailboxes().forEach((mailbox) => {
          mailbox.enabledServices.forEach((service) => {
            if (service.type !== CoreService.SERVICE_TYPES.DEFAULT) {
              mailboxActions.reduceService.defer(mailbox.id, service.type, ServiceReducer.setSleepable, true)
            }
          })
        })
        window.location.hash = '/optimize_wizard/sleep_display'
      }, 100)
    })
  }

  /**
  * Customizes the settings
  */
  handleCustomizeSettings = () => {
    if (this.state.isOptimizing) { return }
    window.location.hash = '/optimize_wizard/sleep_advanced'
  }

  /**
  * Keeps the current settings
  */
  handleKeepSettings = () => {
    if (this.state.isOptimizing) { return }
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
      isOptimizing
    } = this.state

    return (
      <div style={styles.container} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
        <div style={styles.leadPane}>
          <h1 style={styles.leadTitle}>Account Sleeping</h1>
          <p>
            You can set your accounts to sleep automatically when not in use. This helps your machine
            to run more efficiently. An account will wake up the next time you click on it and be ready
            to use in no time at all. Automatically optimize Wavebox or customize each service individually
            by choosing an option below.
          </p>
        </div>
        {hasSleepable ? (
          <div style={styles.optionsPane}>
            <div style={styles.option}>
              <div style={styles.optionAvatarContainer}>
                <Avatar
                  style={styles.optionAvatar}
                  onClick={this.handleAutoOptimizeSettings}
                  color='white'
                  backgroundColor={Colors.green600}
                  icon={(<FontIcon className='fa fa-fw fa-fighter-jet' />)}
                  size={100} />
              </div>
              <div style={styles.optionBody}>
                <p style={styles.optionDescription}>
                  Enable sleep for all additional services, to keep quick access to my primary services
                  and save resouces by sleeping the others.
                </p>
                <RaisedButton
                  primary
                  disabled={isOptimizing}
                  icon={isOptimizing ? (
                    <span>
                      <FontIcon className='fa fa-spin fa-circle-o-notch' color='rgba(0, 0, 0, 0.3)' style={{ fontSize: '20px' }} />
                    </span>
                  ) : undefined}
                  label='Automatically optimize my Wavebox (Recommended)'
                  onClick={this.handleAutoOptimizeSettings} />
              </div>
            </div>
            <div style={styles.option}>
              <div style={styles.optionAvatarContainer}>
                <Avatar
                  style={styles.optionAvatar}
                  onClick={this.handleCustomizeSettings}
                  color='white'
                  backgroundColor={Colors.blue600}
                  icon={(<FontIcon className='fa fa-fw fa-cogs' />)}
                  size={100} />
              </div>
              <div style={styles.optionBody}>
                <p style={styles.optionDescription}>
                  Decide which services you want to sleep to make sure Wavebox works for your workflow.
                </p>
                <RaisedButton
                  label='Customize my settings'
                  disabled={isOptimizing}
                  onClick={this.handleCustomizeSettings} />
              </div>
            </div>
            <div style={{ ...styles.option, marginBottom: 0 }}>
              <div style={styles.optionAvatarContainer}>
                <Avatar
                  style={styles.optionAvatar}
                  onClick={this.handleKeepSettings}
                  color='white'
                  backgroundColor={Colors.grey600}
                  icon={(<FontIcon className='fa fa-fw fa-tasks' />)}
                  size={100} />
              </div>
              <div style={styles.optionBody}>
                <p style={styles.optionDescription}>
                  Leave my configuration as it is already.
                </p>
                <RaisedButton
                  label='Keep my current configuration'
                  disabled={isOptimizing}
                  onClick={this.handleKeepSettings} />
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.purchaseContainer}>
            <p>You can sleep any of your accounts and services when you purchase Wavebox.</p>
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
