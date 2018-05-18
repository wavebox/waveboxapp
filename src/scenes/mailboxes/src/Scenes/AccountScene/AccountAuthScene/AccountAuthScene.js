import PropTypes from 'prop-types'
import React from 'react'
import { Dialog, DialogContent, Button, List, ListItem, ListItemText, Avatar, Icon } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore } from 'stores/mailbox'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import { userActions } from 'stores/user'
import { PRIVACY_URL, TERMS_URL } from 'shared/constants'
import electron from 'electron'
import { withStyles } from '@material-ui/core/styles'
import StyleMixins from 'wbui/Styles/StyleMixins'
import grey from '@material-ui/core/colors/grey'
import blue from '@material-ui/core/colors/blue'

const styles = {
  dialog: {
    maxWidth: 800
  },
  dialogContent: {
    ...StyleMixins.alwaysShowVerticalScrollbars
  },
  container: {
    display: 'flex',
    alignItems: 'stretch'
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: 16
  },
  accountContainer: {
    display: 'flex',
    width: '50%',
    paddingLeft: 16
  },
  link: {
    color: blue[700]
  },
  terms: {
    color: grey[700],
    fontSize: '85%'
  },
  accountAvatar: {
    marginLeft: 3
  },
  googleAvatar: {
    backgroundColor: 'rgb(223, 75, 56)',
    color: 'white'
  },
  microsoftAvatar: {
    backgroundColor: 'rgb(0, 114, 198)',
    color: 'white'
  }
}

@withStyles(styles)
class AccountAuthScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes: {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mode: PropTypes.string
      })
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      mailboxes: mailboxStore.getState().getMailboxesSupportingWaveboxAuth()
    }
  })()

  mailboxChanged = (mailboxState) => {
    this.setState({
      mailboxes: mailboxState.getMailboxesSupportingWaveboxAuth()
    })
  }

  /* **************************************************************************/
  // User Interaction
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
  * Shows privacy policy
  */
  handleShowPrivacyPolicy = (evt) => {
    evt.preventDefault()
    electron.remote.shell.openExternal(PRIVACY_URL)
  }

  /**
  * Shows terms of use
  */
  handleShowTermsOfUse = (evt) => {
    evt.preventDefault()
    electron.remote.shell.openExternal(TERMS_URL)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the message for the given mode with a default catch all
  * @param mode: the mode to render the message for
  * @return jsx
  */
  renderMessage (mode) {
    if (mode === 'payment') {
      return (
        <div>
          <h3>
            To purchase Wavebox you will need to select which account you want to use for billing
          </h3>
          <p>
            If you don't want to use one of the accounts you've already added to Wavebox,
            you can use with another one
          </p>
        </div>
      )
    } else if (mode === 'affiliate') {
      return (
        <div>
          <h3>
            To get your affiliate links you'll need to select which account you want to
            use as your affiliate & payment account with Wavebox
          </h3>
          <p>
            If you don't want to use one of the accounts you've already added to Wavebox,
            you can use with another one
          </p>
        </div>
      )
    } else {
      return (
        <div>
          <h3>
            You need to pick the account you want to use for billing
          </h3>
          <p>
            If you don't want to use one of the accounts you've already added to Wavebox,
            you can use with another one
          </p>
        </div>
      )
    }
  }

  render () {
    const { open, mailboxes } = this.state
    const {
      match: { params: { mode } },
      classes
    } = this.props

    return (
      <Dialog open={open} onClose={this.handleClose} classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.container}>
            <div className={classes.infoContainer}>
              {this.renderMessage(mode)}
              <p className={classes.terms}>
                <span>By continuing you agree to our </span>
                <a className={classes.link} onClick={this.handleShowTermsOfUse} href='#'>
                  terms of use
                </a>
                <span> and </span>
                <a className={classes.link} onClick={this.handleShowPrivacyPolicy} href='#'>
                  privacy policy
                </a>
              </p>
              <br />
              <Button onClick={this.handleClose}>Cancel</Button>
            </div>
            <div className={classes.accountContainer}>
              <List>
                {mailboxes.map((mailbox) => {
                  return (
                    <ListItem
                      key={mailbox.id}
                      button
                      disableGutters
                      onClick={(evt) => userActions.authenticateWithMailbox(mailbox, { mode: mode })}>
                      <MailboxAvatar className={classes.accountAvatar} mailboxId={mailbox.id} />
                      <ListItemText
                        primary={mailbox.displayName}
                        secondary={mailbox.humanizedType} />
                    </ListItem>)
                })}
                <ListItem
                  button
                  disableGutters
                  onClick={(evt) => userActions.authenticateWithGoogle({ mode: mode })}>
                  <Avatar className={classes.googleAvatar}>
                    <Icon className='fab fa-fw fa-google' />
                  </Avatar>
                  <ListItemText
                    primary='Sign in with Google'
                    secondary='Use a different Google Account' />
                </ListItem>
                <ListItem
                  button
                  disableGutters
                  onClick={(evt) => userActions.authenticateWithMicrosoft({ mode: mode })}>
                  <Avatar className={classes.microsoftAvatar}>
                    <Icon className='fab fa-fw fa-windows' />
                  </Avatar>
                  <ListItemText
                    primary='Sign in with Microsoft'
                    secondary='Use a different Outlook or Office Account' />
                </ListItem>
              </List>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default AccountAuthScene
