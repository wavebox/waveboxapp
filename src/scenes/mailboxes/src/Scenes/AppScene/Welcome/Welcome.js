import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import { mailboxActions } from 'stores/mailbox'
import { userStore } from 'stores/user'
import { wmailStore } from 'stores/wmail'
import MicrosoftMailbox from 'shared/Models/Accounts/Microsoft/MicrosoftMailbox'
import TrelloMailbox from 'shared/Models/Accounts/Trello/TrelloMailbox'
import SlackMailbox from 'shared/Models/Accounts/Slack/SlackMailbox'
import GenericMailbox from 'shared/Models/Accounts/Generic/GenericMailbox'
import GoogleMailbox from 'shared/Models/Accounts/Google/GoogleMailbox'
import { TERMS_URL, EULA_URL } from 'shared/constants'
import WelcomeRaisedButton from './WelcomeRaisedButton'
import WelcomeAccountButton from './WelcomeAccountButton'

const { remote: { shell } } = window.nativeRequire('electron')

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflowY: 'auto'
  },

  // Intro
  intro: {
    color: Colors.blueGrey800,
    textAlign: 'center'
  },
  introIcon: {
    height: 150,
    width: 150
  },
  introTitle: {
    fontWeight: '300'
  },
  introSubtitle: {
    fontWeight: '300'
  },
  introTerms: {
    fontSize: '12px'
  },
  introTermsLink: {
    textDecoration: 'underline',
    color: Colors.lightBlue400,
    cursor: 'pointer'
  },

  // Accounts
  accounts: {
    marginTop: 40,
    marginBottom: 40,
    textAlign: 'center'
  },
  accountIcon: {
    display: 'inline-block',
    marginLeft: 20,
    marginRight: 20
  },

  // Extra
  extraActions: {
    textAlign: 'center'
  },
  extraActionButton: {
    display: 'inline-block',
    marginLeft: 16,
    marginRight: 16
  }
}

export default class Welcome extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      user: userStore.getState().user,
      canImportWmail: wmailStore.getState().canImport()
    }
  })()

  userChanged = (userState) => {
    this.setState({ user: userState.user })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Opens the generic add wizard
  */
  handleOpenAddWizard = () => {
    window.location.hash = '/mailbox_wizard/add'
  }

  /**
  * Opens the account screen in settings
  */
  handleLoginWavebox = () => {
    window.location.hash = '/account/auth/'
  }

  /**
  * Opens the WMail import wizard
  */
  handleWmailImport = () => {
    window.location.hash = '/wmailimport/start'
  }

  /**
  * Opens the EULA externally
  */
  handleOpenEULA = () => {
    shell.openExternal(EULA_URL)
  }

  /**
  * Opens the terms externally
  */
  handleOpenTerms = () => {
    shell.openExternal(TERMS_URL)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders an account
  * @param user: the user object
  * @param type: the account type
  * @param logo: the account logo
  * @param name: the account type name
  * @param action: callback to execute on click
  * @return jsx or undefined
  */
  renderMailboxType (user, type, logo, name, action) {
    return (
      <WelcomeAccountButton
        tooltipText={`Add ${name}`}
        size={60}
        logoPath={'../../' + logo}
        onClick={() => user.hasAccountsOfType(type) ? action() : this.handleOpenAddWizard()}
        style={styles.accountIcon} />
    )
  }

  render () {
    const { canImportWmail, user } = this.state

    return (
      <div style={styles.container}>
        <div>
          <div style={styles.intro}>
            <img style={styles.introIcon} src='../../icons/app.svg' />
            <h1 style={styles.introTitle}>
              Add your first account
            </h1>
            <h3 style={styles.introSubtitle}>
              Get started by adding your first account. Tap on an icon below...
            </h3>
            <p style={styles.introTerms}>
              <span>By continuing you agree to the Software </span>
              <span style={styles.introTermsLink} onClick={this.handleOpenEULA}>EULA</span>
              <span> and our </span>
              <span style={styles.introTermsLink} onClick={this.handleOpenTerms}>service terms</span>
            </p>
          </div>
          <div style={styles.accounts}>
            {this.renderMailboxType(user, GoogleMailbox.type, GoogleMailbox.humanizedGmailVectorLogo, 'Gmail', mailboxActions.startAddGmailWizard)}
            {this.renderMailboxType(user, GoogleMailbox.type, GoogleMailbox.humanizedGinboxVectorLogo, 'Google Inbox', mailboxActions.startAddGinboxWizard)}
            {this.renderMailboxType(user, MicrosoftMailbox.type, MicrosoftMailbox.humanizedOutlookVectorLogo, 'Outlook', mailboxActions.startAddOutlookWizard)}
            {this.renderMailboxType(user, MicrosoftMailbox.type, MicrosoftMailbox.humanizedOffice365VectorLogo, 'Office 365', mailboxActions.startAddOffice365Wizard)}
            {this.renderMailboxType(user, TrelloMailbox.type, TrelloMailbox.humanizedVectorLogo, 'Trello', mailboxActions.startAddTrelloWizard)}
            {this.renderMailboxType(user, SlackMailbox.type, SlackMailbox.humanizedVectorLogo, 'Slack', mailboxActions.startAddSlackWizard)}
            {this.renderMailboxType(user, GenericMailbox.type, GenericMailbox.humanizedVectorLogo, 'Any Web Link', mailboxActions.startAddGenericWizard)}
          </div>
          <div style={styles.extraActions}>
            {!user.isLoggedIn ? (
              <WelcomeRaisedButton
                onClick={this.handleLoginWavebox}
                style={styles.extraActionButton}
                label='Already a User? Login' />
            ) : undefined}
            {canImportWmail ? (
              <WelcomeRaisedButton
                onClick={this.handleWmailImport}
                style={styles.extraActionButton}
                label='Import from WMail' />
            ) : undefined}
          </div>
        </div>
      </div>
    )
  }
}
