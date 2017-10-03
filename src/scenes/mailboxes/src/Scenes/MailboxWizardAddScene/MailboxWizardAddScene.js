import React from 'react'
import './MailboxWizardAddScene.less'
import * as Colors from 'material-ui/styles/colors'
import { FlatButton, RaisedButton } from 'material-ui'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { FullscreenModal } from 'Components'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import MicrosoftMailbox from 'shared/Models/Accounts/Microsoft/MicrosoftMailbox'
import TrelloMailbox from 'shared/Models/Accounts/Trello/TrelloMailbox'
import SlackMailbox from 'shared/Models/Accounts/Slack/SlackMailbox'
import GenericMailbox from 'shared/Models/Accounts/Generic/GenericMailbox'
import GoogleMailbox from 'shared/Models/Accounts/Google/GoogleMailbox'
import MailboxWizardAccountButton from './MailboxWizardAccountButton'

const styles = {
  // Modal
  modalBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 52,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: 'rgb(242, 242, 242)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
  },
  modalActions: {
    position: 'absolute',
    height: 52,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(242, 242, 242)',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2
  },
  modalActionExtraButton: {
    marginRight: 8
  },

  // Title
  titleContainer: {
    color: Colors.blueGrey800,
    textAlign: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16
  },
  titleText: {
    fontWeight: '300'
  },

  // Accounts
  accountContainer: {
    paddingBottom: 16,
    textAlign: 'center'
  },
  accountset: {
    textAlign: 'center'
  },
  accountIcon: {
    margin: '8px 16px'
  },

  // Account limit
  accountLimitReachedContainer: {
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 8
  },
  accountLimitReachedText: {
    color: Colors.lightBlue500,
    fontWeight: '300',
    marginTop: 0
  },

  // Account unavailable
  accountUnavailable: {
    border: `2px solid ${Colors.lightBlue500}`,
    borderRadius: 4,
    padding: 16,
    margin: 8,
    maxWidth: '100%',
    display: 'inline-block'
  },
  accountUnavailableInfo: {
    textAlign: 'center',
    paddingBottom: 8
  },
  accountUnavailableText: {
    color: Colors.lightBlue500,
    fontWeight: '300',
    marginTop: 0
  }
}

export default class MailboxWizardAddScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
    mailboxStore.listen(this.mailboxUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
    mailboxStore.unlisten(this.mailboxUpdated)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()
    return {
      open: true,
      user: userState.user,
      canAddMailbox: mailboxState.canAddUnrestrictedMailbox(userState.user)
    }
  })()

  userUpdated = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      user: userState.user,
      canAddMailbox: mailboxState.canAddUnrestrictedMailbox(userState.user)
    })
  }

  mailboxUpdated = (mailboxState) => {
    const userState = userStore.getState()
    this.setState({
      canAddMailbox: mailboxState.canAddUnrestrictedMailbox(userState.user)
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /**
  * Closes the modal and takes the user to the pro scene
  */
  handleShowPro = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/pro'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      open,
      user,
      canAddMailbox
    } = this.state

    const accounts = [
      {
        key: 'gmail',
        buttonText: 'Gmail',
        logoPath: `../../${GoogleMailbox.humanizedGmailVectorLogo}`,
        accountType: GoogleMailbox.type,
        clickHandler: mailboxActions.startAddGmailWizard
      },
      {
        key: 'googleinbox',
        buttonText: 'Google Inbox',
        logoPath: `../../${GoogleMailbox.humanizedGinboxVectorLogo}`,
        accountType: GoogleMailbox.type,
        clickHandler: mailboxActions.startAddGinboxWizard
      },
      {
        key: 'outlook',
        buttonText: 'Outlook',
        logoPath: `../../${MicrosoftMailbox.humanizedOutlookVectorLogo}`,
        accountType: MicrosoftMailbox.type,
        clickHandler: mailboxActions.startAddOutlookWizard
      },
      {
        key: 'office365',
        buttonText: 'Office 365',
        logoPath: `../../${MicrosoftMailbox.humanizedOffice365VectorLogo}`,
        accountType: MicrosoftMailbox.type,
        clickHandler: mailboxActions.startAddOffice365Wizard
      },
      {
        key: 'trello',
        buttonText: 'Trello',
        logoPath: `../../${TrelloMailbox.humanizedVectorLogo}`,
        accountType: TrelloMailbox.type,
        clickHandler: mailboxActions.startAddTrelloWizard
      },
      {
        key: 'slack',
        buttonText: 'Slack',
        logoPath: `../../${SlackMailbox.humanizedVectorLogo}`,
        accountType: SlackMailbox.type,
        clickHandler: mailboxActions.startAddSlackWizard
      },
      {
        key: 'generic',
        buttonText: 'Weblink',
        logoPath: `../../${GenericMailbox.humanizedVectorLogo}`,
        accountType: GenericMailbox.type,
        clickHandler: mailboxActions.startAddGenericWizard
      }
    ]

    const { enabledAccounts, disabledAccounts } = accounts.reduce((acc, account) => {
      if (user.hasAccountsOfType(account.accountType)) {
        acc.enabledAccounts.push(account)
      } else {
        acc.disabledAccounts.push(account)
      }
      return acc
    }, { enabledAccounts: [], disabledAccounts: [] })

    const actions = (
      <div>
        {!canAddMailbox || disabledAccounts.length !== 0 ? (
          <FlatButton
            primary
            label='Purchase Wavebox'
            style={styles.modalActionExtraButton}
            onClick={this.handleShowPro} />
        ) : undefined}
        <RaisedButton label='Cancel' onClick={this.handleClose} />
      </div>
    )

    return (
      <FullscreenModal
        modal={false}
        bodyStyle={styles.modalBody}
        actionsContainerStyle={styles.modalActions}
        actions={actions}
        open={open}
        onRequestClose={this.handleClose}>
        <div style={styles.titleContainer}>
          <h1 style={styles.titleText}>
            Add your next account
          </h1>
          <h3 style={styles.titleText}>
            Get even more from Wavebox by adding your next account
          </h3>
        </div>
        {canAddMailbox ? (
          <div style={styles.accountContainer} className='ReactComponent-MailboxWizardAddScene-AutoScroller'>
            <div style={styles.accountset}>
              {enabledAccounts.map((account) => {
                return (
                  <MailboxWizardAccountButton
                    key={account.key}
                    buttonText={account.buttonText}
                    logoPath={account.logoPath}
                    onClick={account.clickHandler}
                    logoSize={60}
                    style={styles.accountIcon}
                    disabled={false} />
                )
              })}
            </div>
            {disabledAccounts.length ? (
              <div style={styles.accountUnavailable}>
                <div style={styles.accountUnavailableInfo}>
                  <h4 style={styles.accountUnavailableText}>
                    Add all these account types when you purchase Wavebox
                  </h4>
                  <RaisedButton
                    primary
                    label='Find out more'
                    onClick={this.handleShowPro} />
                </div>
                <div style={styles.accountset}>
                  {disabledAccounts.map((account) => {
                    return (
                      <MailboxWizardAccountButton
                        key={account.key}
                        buttonText={account.buttonText}
                        logoPath={account.logoPath}
                        onClick={account.clickHandler}
                        logoSize={60}
                        style={styles.accountIcon}
                        disabled />
                    )
                  })}
                </div>
              </div>
            ) : undefined}
          </div>
        ) : (
          <div style={styles.accountContainer} className='ReactComponent-MailboxWizardAddScene-AutoScroller'>
            <div style={styles.accountLimitReachedContainer}>
              <h4 style={styles.accountLimitReachedText}>
                Use an unlimited amount of accounts when you purchase Wavebox
              </h4>
              <RaisedButton
                primary
                label='Find out more'
                onClick={this.handleShowPro} />
            </div>
            <div style={styles.accountset}>
              {accounts.map((account) => {
                return (
                  <MailboxWizardAccountButton
                    key={account.key}
                    buttonText={account.buttonText}
                    logoPath={account.logoPath}
                    logoSize={60}
                    style={styles.accountIcon}
                    disabled />
                )
              })}
            </div>
          </div>
        )}
      </FullscreenModal>
    )
  }
}
