import React from 'react'
import { Paper, Checkbox, List, ListItem, RaisedButton, FlatButton, FontIcon } from 'material-ui'
import { mailboxStore, mailboxActions, ServiceReducer, MailboxReducer } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { settingsStore, settingsActions } from 'stores/settings'
import * as Colors from 'material-ui/styles/colors'
import { Row, Col } from 'Components/Grid'
import CoreService from 'shared/Models/Accounts/CoreService'
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
    padding: 16
  },
  leadTitle: {
    fontWeight: 300,
    fontSize: 35
  },

  // Action
  actionPane: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16
  },

  // Mailbox
  mailboxPane: {
    margin: 16,
    padding: 16,
    maxWidth: 600
  },
  mailboxPaneHr: {
    borderBottom: '1px solid black',
    borderTop: 'none'
  },

  // Services
  servicesColumn: {
    paddingTop: 0,
    paddingBottom: 0
  },
  serviceIcon: {
    display: 'inline-block',
    height: 30,
    top: 12
  }
}

export default class OptimizeWizardSleepCustomizeScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesUpdated)
    userStore.listen(this.userUpdated)
    settingsStore.listen(this.settingsUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesUpdated)
    userStore.unlisten(this.userUpdated)
    settingsStore.unlisten(this.settingsUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()
    const mailboxes = mailboxState.allMailboxes()
    return {
      hasSleepable: userStore.getState().user.hasSleepable,
      isOptimizing: false,
      mailboxes: mailboxes,
      allMailboxesShowSleepableServiceIndicator: !mailboxes.find((mailbox) => !mailbox.showSleepableServiceIndicator),
      showSleepableServiceIndicator: settingsStore.getState().ui.showSleepableServiceIndicator
    }
  })()

  mailboxesUpdated = (mailboxState) => {
    const mailboxes = mailboxState.allMailboxes()
    this.setState({
      mailboxes: mailboxes,
      allMailboxesShowSleepableServiceIndicator: !mailboxes.find((mailbox) => !mailbox.showSleepableServiceIndicator)
    })
  }

  userUpdated = (userState) => {
    this.setState({
      hasSleepable: userState.user.hasSleepable
    })
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      showSleepableServiceIndicator: settingsState.ui.showSleepableServiceIndicator
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Sets the most optimized settings
  */
  handleSetOptimizedSettings = () => {
    this.setState({ isOptimizing: true }, () => {
      setTimeout(() => {
        mailboxStore.getState().allMailboxes().forEach((mailbox) => {
          mailbox.enabledServices.forEach((service) => {
            if (service.type !== CoreService.SERVICE_TYPES.DEFAULT) {
              mailboxActions.reduceService.defer(mailbox.id, service.type, ServiceReducer.setSleepable, true)
            }
          })
        })
        setTimeout(() => {
          this.setState({ isOptimizing: false })
        }, 100)
      }, 100)
    })
  }

  /**
  * Sets the main settings and all sub-settings to indicate when services are sleeping
  * @param evt: the event that fired
  * @param show: true to show the indicator
  */
  handleSetShowSleepingServiceIndicator = (evt, show) => {
    if (show) {
      settingsActions.sub.ui.setShowSleepableServiceIndicator(true)
      mailboxStore.getState().allMailboxes().forEach((mailbox) => {
        mailboxActions.reduce(mailbox.id, MailboxReducer.setShowSleepableServiceIndicator, true)
      })
    } else {
      settingsActions.sub.ui.setShowSleepableServiceIndicator(false)
    }
  }

  /**
  * Opens the pro dialog
  * @param evt: the event that fired
  */
  handleOpenPro = (evt) => {
    window.location.hash = '/pro'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders a service item
  * @param key: the key for the element
  * @param mailbox: the mailbox
  * @param service: the service
  * @param hasSleepable: true if the user has sleepable
  * @return jsx
  */
  renderServiceItem (key, mailbox, service) {
    return (
      <ListItem
        key={key}
        primaryText={service.humanizedType}
        leftCheckbox={(
          <Checkbox
            checked={service.sleepable}
            onCheck={(evt, toggled) => {
              mailboxActions.reduceService(mailbox.id, service.type, ServiceReducer.setSleepable, toggled)
            }}
          />
        )} />
    )
  }

  /**
  * Renders the mailboxes
  * @param mailboxes: the mailboxes to render
  * @return jsx
  */
  renderMailboxes (mailboxes) {
    return (
      <div>
        {mailboxes.map((mailbox) => {
          const defaultService = mailbox.defaultService
          const additionalServices = mailbox.additionalServices
          const additionalServices1 = additionalServices.slice(0, Math.ceil(additionalServices.length / 2))
          const additionalServices2 = additionalServices.slice(Math.ceil(additionalServices.length / 2))

          const primaryServiceText = mailbox.hasAdditionalServices ? (
            `${mailbox.displayName} : ${defaultService.humanizedType}`
          ) : (
            mailbox.displayName
          )

          return (
            <Paper key={mailbox.id} style={styles.mailboxPane}>
              <List style={styles.servicesColumn}>
                <ListItem
                  primaryText={primaryServiceText}
                  leftAvatar={(
                    <img
                      src={Resolver.image(defaultService.humanizedLogo)}
                      style={styles.serviceIcon} />
                  )}
                  rightToggle={(
                    <Checkbox
                      checked={defaultService.sleepable}
                      onCheck={(evt, toggled) => {
                        mailboxActions.reduceService(mailbox.id, defaultService.type, ServiceReducer.setSleepable, toggled)
                      }}
                    />
                  )} />
              </List>
              {additionalServices.length ? (
                <div>
                  <hr />
                  <Row>
                    <Col sm={6}>
                      <List style={styles.servicesColumn}>
                        {additionalServices1.map((service) => {
                          return this.renderServiceItem(`${mailbox.id}:${service.type}`, mailbox, service)
                        })}
                      </List>
                    </Col>
                    <Col sm={6}>
                      <List style={styles.servicesColumn}>
                        {additionalServices2.map((service) => {
                          return this.renderServiceItem(`${mailbox.id}:${service.type}`, mailbox, service)
                        })}
                      </List>
                    </Col>
                  </Row>
                </div>
              ) : undefined}
            </Paper>
          )
        })}
      </div>
    )
  }

  render () {
    const {
      hasSleepable,
      isOptimizing,
      mailboxes,
      showSleepableServiceIndicator,
      allMailboxesShowSleepableServiceIndicator
    } = this.state

    return (
      <div style={styles.container} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
        <div style={styles.leadPane}>
          <h1 style={styles.leadTitle}>Account Sleeping</h1>
          <p>
            You can set which services should sleep automatically by toggling each one below.
            Enabling sleep on a service when not in use helps your machine to run more efficiently.
          </p>
        </div>
        {hasSleepable ? (
          <div>
            <div style={styles.actionPane}>
              <div>
                <RaisedButton
                  primary
                  disabled={isOptimizing}
                  icon={isOptimizing ? (
                    <span>
                      <FontIcon className='fa fa-spin fa-circle-o-notch' color='rgba(0, 0, 0, 0.3)' style={{ fontSize: '20px' }} />
                    </span>
                  ) : undefined}
                  label='Turn on sleep for all additional services (Recommended)'
                  onClick={this.handleSetOptimizedSettings} />
              </div>
              <br />
              <div>
                <Checkbox
                  checked={showSleepableServiceIndicator && allMailboxesShowSleepableServiceIndicator}
                  label='Grey-out services that are sleeping'
                  onCheck={this.handleSetShowSleepingServiceIndicator} />
              </div>
            </div>
            {this.renderMailboxes(mailboxes)}
          </div>
        ) : (
          <div style={styles.purchaseContainer}>
            <p>You can sleep any of your accounts and services when you purchase Wavebox</p>
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
