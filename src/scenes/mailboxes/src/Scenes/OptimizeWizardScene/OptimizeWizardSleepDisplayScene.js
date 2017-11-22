import React from 'react'
import { Avatar, RaisedButton, FlatButton, FontIcon, Paper } from 'material-ui'
import { mailboxStore, mailboxActions, MailboxReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { settingsActions } from 'stores/settings'
import * as Colors from 'material-ui/styles/colors'
import Resolver from 'Runtime/Resolver'
import { Container, Col, Row } from 'Components/Grid'

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
  option: {
    padding: 16,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 16,
    marginBottom: 16,
    minHeight: 300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    cursor: 'pointer'
  },
  optionImage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: 150,
    width: '100%'
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
            You can choose to display sleeping account icons as grey or full colour. Having them grey will
            help you quickly see which accounts are awake or asleep. Choose an option below.
          </p>
        </div>
        {hasSleepable ? (
          <Container fluid>
            <Row>
              <Col sm={4}>
                <Paper onClick={this.handleEnableSleepIndicator} style={styles.option}>
                  <div style={{
                    ...styles.optionImage,
                    backgroundImage: `url("${Resolver.image('optimize_wizard_sleep_display_indicator.png', Resolver.API_TYPES.BROWSER)}")`
                  }} />
                  <p>Show my service icons in grey when sleeping.</p>
                  <RaisedButton
                    primary
                    disabled={isWorking}
                    icon={isWorking ? (
                      <span>
                        <FontIcon className='fa fa-spin fa-circle-o-notch' color='rgba(0, 0, 0, 0.3)' style={{ fontSize: '20px' }} />
                      </span>
                    ) : undefined}
                    label='Select'
                    onClick={this.handleEnableSleepIndicator} />
                </Paper>
              </Col>
              <Col sm={4}>
                <Paper onClick={this.handleDisableSleepIndicator} style={styles.option}>
                  <div style={{
                    ...styles.optionImage,
                    backgroundImage: `url("${Resolver.image('optimize_wizard_sleep_display_no_indicator.png', Resolver.API_TYPES.BROWSER)}")`
                  }} />
                  <p>Leave my service icons coloured when sleeping.</p>
                  <RaisedButton
                    primary
                    disabled={isWorking}
                    icon={isWorking ? (
                      <span>
                        <FontIcon className='fa fa-spin fa-circle-o-notch' color='rgba(0, 0, 0, 0.3)' style={{ fontSize: '20px' }} />
                      </span>
                    ) : undefined}
                    label='Select'
                    onClick={this.handleDisableSleepIndicator} />
                </Paper>
              </Col>
              <Col sm={4}>
                <Paper onClick={this.handleKeepSettings} style={styles.option}>
                  <div style={styles.optionImage}>
                    <Avatar
                      color='white'
                      backgroundColor={Colors.grey600}
                      icon={(<FontIcon className='fa fa-fw fa-tasks' />)}
                      size={100} />
                  </div>
                  <p>Keep my current configuration.</p>
                  <RaisedButton
                    label='Select'
                    disabled={isWorking}
                    onClick={this.handleKeepSettings} />
                </Paper>
              </Col>
            </Row>
          </Container>
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
