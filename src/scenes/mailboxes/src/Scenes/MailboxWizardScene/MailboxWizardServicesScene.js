const React = require('react')
const { RaisedButton, Dialog, List, ListItem, Toggle, Avatar, SelectField, MenuItem } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const CoreService = require('shared/Models/Accounts/CoreService')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')
const ServiceFactory = require('shared/Models/Accounts/ServiceFactory')
const { mailboxActions, mailboxStore, MailboxReducer } = require('stores/mailbox')
const { userStore } = require('stores/user')

const styles = {
  modalBody: {
    position: 'relative'
  },
  introduction: {
    textAlign: 'center',
    padding: 12,
    fontSize: '110%',
    fontWeight: 'bold'
  },
  serviceGroups: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  serviceList: {
    maxWidth: 320,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: 0,
    paddingBottom: 0,
    display: 'inline-block'
  },
  avatar: {
    border: '2px solid rgb(139, 139, 139)'
  },
  disabledAvatar: {
    filter: 'grayscale(100%)'
  },
  displayModeContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  displayMode: {
    width: 350
  },
  proMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '128px',
    backgroundPosition: 'top right',
    backgroundImage: 'url("../../images/waveboxpro_banner.svg")'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxWizardServicesScene',
  propTypes: {
    nextUrl: React.PropTypes.string.isRequired,
    mailboxId: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },

  getDefaultProps () {
    return {
      title: 'Wavebox also gives you access to the other services you use. Pick which services you would like to enable for this account'
    }
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxUpdated)
    userStore.listen(this.userUpdated)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
    userStore.unlisten(this.userUpdated)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState({
        mailbox: mailboxStore.getState().getMailbox(nextProps.mailboxId)
      })
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: true,
      mailbox: mailboxStore.getState().getMailbox(this.props.mailboxId),
      userHasServices: userStore.getState().user.hasServices
    }
  },

  mailboxUpdated (mailboxState) {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.mailboxId)
    })
  },

  userUpdated (userState) {
    this.setState({
      userHasServices: userState.user.hasServices
    })
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Progresses the user to the next step
  */
  handleNext () {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = this.props.nextUrl
    }, 250)
  },

  /**
  * Opens the pro modal
  */
  handleOpenPro () {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/pro'
    }, 250)
  },

  /**
  * Toggles a service on or off
  * @param evt: the event that fired
  * @param serviceType: the service type to toggle
  * @param toggled: true to toggle the service on, false for off
  */
  toggleService (evt, serviceType, toggled) {
    const id = this.props.mailboxId
    const reducer = toggled ? MailboxReducer.addService : MailboxReducer.removeService
    mailboxActions.reduce(id, reducer, serviceType)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { title } = this.props
    const { open, mailbox, userHasServices } = this.state
    if (!mailbox) { return false } // Sometimes the mailbox isn't available right away

    const serviceTypes = mailbox
      .supportedServiceTypes.filter((serviceType) => {
        return serviceType !== CoreService.SERVICE_TYPES.DEFAULT
      })
    const serviceTypeGroups = [
      serviceTypes.slice(0, Math.ceil(serviceTypes.length / 2)),
      serviceTypes.slice(Math.ceil(serviceTypes.length / 2))
    ]

    const actions = (
      <div>
        {!userHasServices ? (
          <RaisedButton
            label='Discover Pro'
            primary
            onClick={this.handleOpenPro}
            style={{ marginRight: 8 }} />
        ) : undefined}
        <RaisedButton
          label='Next'
          primary
          onClick={this.handleNext} />
      </div>
    )

    return (
      <Dialog
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        bodyStyle={styles.modalBody}
        modal
        actions={actions}
        open={open}
        autoScrollBodyContent>
        <div style={styles.introduction}>
          {title}
        </div>
        <div style={styles.serviceGroups}>
          {serviceTypeGroups.map((serviceGroup, index) => {
            return (
              <List key={'groups_' + index} style={styles.serviceList}>
                {serviceGroup.map((serviceType) => {
                  const serviceClass = ServiceFactory.getClass(mailbox.type, serviceType)
                  return (
                    <ListItem
                      key={serviceType}
                      primaryText={serviceClass.humanizedType}
                      leftAvatar={(
                        <Avatar
                          size={40}
                          src={'../../' + serviceClass.humanizedLogo}
                          backgroundColor='white'
                          style={Object.assign({}, styles.avatar, !userHasServices ? styles.disabledAvatar : undefined)} />
                      )}
                      rightToggle={(
                        <Toggle
                          disabled={!userHasServices}
                          toggled={!!mailbox.serviceForType(serviceType)}
                          onToggle={(evt, toggled) => this.toggleService(evt, serviceType, toggled)} />
                      )} />
                  )
                })}
              </List>
            )
          })}
        </div>
        <br />
        <div style={styles.displayModeContainer}>
          <SelectField
            style={styles.displayMode}
            floatingLabelText='Where do you want to display the services?'
            value={mailbox.serviceDisplayMode}
            disabled={!userHasServices}
            onChange={(evt, index, mode) => {
              mailboxActions.reduce(mailbox.id, MailboxReducer.setServiceDisplayMode, mode)
            }}>
            <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.SIDEBAR} primaryText='Left Sidebar' />
            <MenuItem value={CoreMailbox.SERVICE_DISPLAY_MODES.TOOLBAR} primaryText='Top Toolbar' />
          </SelectField>
        </div>
        {!userHasServices ? (
          <div style={styles.proMask} />
        ) : undefined}
      </Dialog>
    )
  }
})
