const React = require('react')
const { FontIcon, IconButton, FlatButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const { mailboxActions } = require('stores/mailbox')
const { userStore } = require('stores/user')
const { wmailStore } = require('stores/wmail')

const MicrosoftMailbox = require('shared/Models/Accounts/Microsoft/MicrosoftMailbox')
const TrelloMailbox = require('shared/Models/Accounts/Trello/TrelloMailbox')
const SlackMailbox = require('shared/Models/Accounts/Slack/SlackMailbox')
const GenericMailbox = require('shared/Models/Accounts/Generic/GenericMailbox')
const GoogleMailbox = require('shared/Models/Accounts/Google/GoogleMailbox')

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'stretch'
  },
  welcomeContainer: {
    display: 'flex',
    backgroundColor: 'rgb(184, 237, 148)',
    flexDirection: 'column',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url("../../images/welcome_background.png")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  actionContainer: {
    display: 'flex',
    width: '50%',
    overflowY: 'auto'
  },
  actionContainerInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 450,
    height: '100%',
    width: '100%'
  },

  // Intro
  welcomeIcon: {
    maxHeight: 250,
    maxWidth: 250,
    width: '100%',
    height: '100%',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: 'url("../../icons/app_512.png")'
  },
  welcomeIntro: {
    color: 'rgb(74, 189, 231)',
    textAlign: 'center',
    maxWidth: 250,
    fontSize: 20,
    lineHeight: '34px'
  },

  // Action
  actionTitle: {
    fontWeight: 300,
    color: 'rgb(167, 171, 169)',
    margin: 0
  },
  actionAddIconButton: {
    width: 100,
    height: 100,
    marginTop: 20,
    marginBottom: 20
  },
  actionAddIconIcon: {
    fontSize: 80
  },
  actionAddLabel: {
    fontSize: 18,
    fontWeight: 300,
    textTransform: 'none'
  },
  actionProviders: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    paddingLeft: 16,
    paddingRight: 16
  },
  actionProviderIcon: {
    height: 32,
    margin: 10,
    cursor: 'pointer'
  },
  actionLoginLabel: {
    fontWeight: 300,
    textTransform: 'none'
  }
}

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'Welcome',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  },

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      user: userStore.getState().user,
      canImportWmail: wmailStore.getState().canImport()
    }
  },

  userChanged (userState) {
    this.setState({ user: userState.user })
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleOpenAddWizard () {
    window.location.hash = '/mailbox_wizard/add'
  },

  handleOpenAccount () {
    window.location.hash = '/settings/pro'
  },

  handleWmailImport () {
    window.location.hash = '/wmailimport/start'
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders an account
  * @param type: the account type
  * @param logo: the account logo
  * @param action: callback to execute on click
  * @return jsx or undefined
  */
  renderAccount (type, logo, action) {
    return (
      <img
        src={'../../' + logo}
        onClick={() => this.state.user.hasAccountsOfType(type) ? action() : this.handleOpenAddWizard()}
        style={styles.actionProviderIcon} />)
  },

  render () {
    const { canImportWmail } = this.state
    return (
      <div style={styles.container}>
        <div style={styles.welcomeContainer}>
          <div style={styles.welcomeIcon} />
          <p style={styles.welcomeIntro}>
            the open-source desktop client for all your communication needs
          </p>
        </div>
        <div style={styles.actionContainer}>
          <div style={styles.actionContainerInner}>
            <h1 style={styles.actionTitle}>Welcome</h1>
            <IconButton
              style={styles.actionAddIconButton}
              iconStyle={styles.actionAddIconIcon}
              onClick={this.handleOpenAddWizard}>
              <FontIcon
                className='material-icons'
                color={Colors.lightBlue600}>
                add_circle_outline
              </FontIcon>
            </IconButton>
            <FlatButton
              label='add your first account'
              labelStyle={styles.actionAddLabel}
              onClick={this.handleOpenAddWizard}
              primary />
            <div style={styles.actionProviders}>
              {this.renderAccount(GoogleMailbox.type, GoogleMailbox.humanizedGmailVectorLogo, mailboxActions.authenticateGmailMailbox)}
              {this.renderAccount(GoogleMailbox.type, GoogleMailbox.humanizedGinboxVectorLogo, mailboxActions.authenticateGinboxMailbox)}
              {this.renderAccount(MicrosoftMailbox.type, MicrosoftMailbox.humanizedOutlookVectorLogo, mailboxActions.authenticateOutlookMailbox)}
              {this.renderAccount(MicrosoftMailbox.type, MicrosoftMailbox.humanizedOffice365VectorLogo, mailboxActions.authenticateOffice365Mailbox)}
              {this.renderAccount(TrelloMailbox.type, TrelloMailbox.humanizedVectorLogo, mailboxActions.authenticateTrelloMailbox)}
              {this.renderAccount(SlackMailbox.type, SlackMailbox.humanizedVectorLogo, mailboxActions.authenticateSlackMailbox)}
              {this.renderAccount(GenericMailbox.type, GenericMailbox.humanizedVectorLogo, mailboxActions.authenticateGenericMailbox)}
            </div>
            <FlatButton
              label='Already have a Wavebox Account?'
              labelStyle={styles.actionLoginLabel}
              onClick={this.handleOpenAccount}
              primary />
            {canImportWmail ? (
              <FlatButton
                label='Import everything from WMail'
                labelPosition='before'
                labelStyle={styles.actionLoginLabel}
                onClick={this.handleWmailImport}
                icon={<img style={{ height: 24 }} src='../../images/wmail_icon.svg' />}
                primary />
            ) : undefined}
          </div>
        </div>
      </div>
    )
  }
})
