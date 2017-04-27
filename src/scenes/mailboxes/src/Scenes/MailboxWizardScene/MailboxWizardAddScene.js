import React from 'react'
import { Dialog, RaisedButton } from 'material-ui'
import { mailboxActions, mailboxStore } from 'stores/mailbox'
import { userStore } from 'stores/user'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col, Visible } from 'Components/Grid'
import MicrosoftMailbox from 'shared/Models/Accounts/Microsoft/MicrosoftMailbox'
import TrelloMailbox from 'shared/Models/Accounts/Trello/TrelloMailbox'
import SlackMailbox from 'shared/Models/Accounts/Slack/SlackMailbox'
import GenericMailbox from 'shared/Models/Accounts/Generic/GenericMailbox'
import GoogleMailbox from 'shared/Models/Accounts/Google/GoogleMailbox'

const styles = {
  mailboxCell: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 40,
    marginRight: 40
  },
  mailboxAvatar: {
    cursor: 'pointer',
    height: 80,
    width: 80,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    display: 'block',
    margin: '10px auto'
  },
  mailboxAvatarProCover: {
    backgroundSize: 'contain, contain',
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundPosition: 'center, center'
  },
  introduction: {
    textAlign: 'center',
    padding: 12,
    fontSize: '110%',
    fontWeight: 'bold'
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
    }, 500)
  }

  /**
  * Closes the modal and takes the user to the pro scene
  */
  handleShowPro () {
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

  /**
  * Renders the standard mailbox type
  * @param mailboxType: the type of the mailbox
  * @param imageSrc: the source of the image
  * @param label: the label text
  * @param onClick: function to exec on click
  * @return jsx
  */
  renderMailboxType (mailboxType, imageSrc, label, onClick) {
    const { user, canAddMailbox } = this.state
    const hasAccountsOfType = user.hasAccountsOfType(mailboxType)
    const avatarStyle = Object.assign(
      {
        backgroundImage: [
          !hasAccountsOfType ? 'url("../../images/waveboxpro_banner.svg")' : undefined,
          `url("${imageSrc}")`
        ].filter((i) => !!i).join(',')
      },
      styles.mailboxAvatar,
      !hasAccountsOfType ? styles.mailboxAvatarProCover : undefined
    )

    return (
      <div style={styles.mailboxCell}>
        <div
          onClick={hasAccountsOfType && canAddMailbox ? onClick : this.handleShowPro}
          style={avatarStyle} />
        <RaisedButton
          label={label}
          primary
          onClick={hasAccountsOfType && canAddMailbox ? onClick : this.handleShowPro} />
      </div>
    )
  }

  /**
  * Renders the gmail option
  * @return jsx
  */
  renderGmail () {
    return this.renderMailboxType(GoogleMailbox.type, '../../' + GoogleMailbox.humanizedGmailVectorLogo, 'Add Gmail', () => {
      mailboxActions.authenticateGmailMailbox()
    })
  }

  /**
  * Renders the google inbox option
  * @return jsx
  */
  renderGinbox () {
    return this.renderMailboxType(GoogleMailbox.type, '../../' + GoogleMailbox.humanizedGinboxVectorLogo, 'Add Google Inbox', () => {
      mailboxActions.authenticateGinboxMailbox()
    })
  }

  /**
  * Renders the slack option
  * @return jsx
  */
  renderSlack () {
    return this.renderMailboxType(SlackMailbox.type, '../../' + SlackMailbox.humanizedVectorLogo, 'Add Slack Team', () => {
      mailboxActions.authenticateSlackMailbox()
    })
  }

  /**
  * Renders the trello option
  * @return jsx
  */
  renderTrello () {
    return this.renderMailboxType(TrelloMailbox.type, '../../' + TrelloMailbox.humanizedVectorLogo, 'Add Trello', () => {
      mailboxActions.authenticateTrelloMailbox()
    })
  }

  /**
  * Renders the outlook option
  * @return jsx
  */
  renderOutlook () {
    return this.renderMailboxType(MicrosoftMailbox.type, '../../' + MicrosoftMailbox.humanizedOutlookVectorLogo, 'Add Outlook', () => {
      mailboxActions.authenticateOutlookMailbox()
    })
  }

  /**
  * Renders the office365 option
  * @return jsx
  */
  renderOffice365 () {
    return this.renderMailboxType(MicrosoftMailbox.type, '../../' + MicrosoftMailbox.humanizedOffice365Logo, 'Add Office 365', () => {
      mailboxActions.authenticateOffice365Mailbox()
    })
  }

  /**
  * Renders the generic option
  * @return jsx
  */
  renderGeneric () {
    return this.renderMailboxType(GenericMailbox.type, '../../' + GenericMailbox.humanizedVectorLogo, 'Add any website', () => {
      mailboxActions.authenticateGenericMailbox()
    })
  }

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <RaisedButton label='Cancel' onClick={this.handleClose} />
      </div>
    )

    return (
      <Dialog
        modal={false}
        actions={actions}
        open={open}
        autoScrollBodyContent
        contentStyle={{ width: '90%', maxWidth: 900 }}
        onRequestClose={this.handleClose}>
        <div style={styles.introduction}>
          Pick the type of account you want to add
        </div>
        <Visible hidden='xs,sm'>
          <Row>
            <Col xs={4}>{this.renderGmail()}</Col>
            <Col xs={4}>{this.renderGinbox()}</Col>
            <Col xs={4}>{this.renderOutlook()}</Col>
          </Row>
          <Row>
            <Col xs={4}>{this.renderOffice365()}</Col>
            <Col xs={4}>{this.renderTrello()}</Col>
            <Col xs={4}>{this.renderSlack()}</Col>
          </Row>
          <Row>
            <Col xs={4} offset={4}>{this.renderGeneric()}</Col>
          </Row>
        </Visible>
        <Visible hidden='md,lg'>
          <Row>
            <Col xs={6}>{this.renderGmail()}</Col>
            <Col xs={6}>{this.renderGinbox()}</Col>
          </Row>
          <Row>
            <Col xs={6}>{this.renderOutlook()}</Col>
            <Col xs={6}>{this.renderOffice365()}</Col>
          </Row>
          <Row>
            <Col xs={6}>{this.renderTrello()}</Col>
            <Col xs={6}>{this.renderSlack()}</Col>
          </Row>
          <Row>
            <Col xs={6} offset={3}>{this.renderGeneric()}</Col>
          </Row>
        </Visible>
      </Dialog>
    )
  }
}
