import React from 'react'
import { Button, Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { userStore } from 'stores/user'
import PropTypes from 'prop-types'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import MailboxServiceIcon from 'wbui/MailboxServiceIcon'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import red from '@material-ui/core/colors/red'
import DeleteIcon from '@material-ui/icons/Delete'

const styles = {
  dialogContent: {
    width: 600
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    margin: '10px 20px 10px 10px'
  },
  message: {
    fontWeight: 'bold'
  },
  servicesContainer: {
    paddingTop: 4,
    paddingBottom: 4
  },
  serviceLogo: {
    display: 'inline-block',
    marginLeft: 4,
    marginRight: 4
  },
  cancelButton: {
    marginRight: 8
  },
  deleteButton: {
    color: red[600]
  },
  deleteIcon: {
    marginRight: 6
  },
  accountName: {
    color: grey[700]
  }
}

@withStyles(styles)
class MailboxDeleteScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxId: PropTypes.string.isRequired
      })
    })
  }
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
    userStore.unlisten(this.userChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.mailboxId !== nextProps.match.params.mailboxId) {
      this.setState({
        mailbox: mailboxStore.getState().getMailbox(nextProps.match.params.mailboxId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()
    return {
      open: true,
      mailbox: mailboxState.getMailbox(this.props.match.params.mailboxId),
      userHasServices: userStore.getState().user.hasServices
    }
  })()

  mailboxChanged = (mailboxState) => {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.match.params.mailboxId)
    })
  }

  userChanged = (userState) => {
    this.setState({
      userHasServices: userState.user.hasServices
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
    }, 250)
  }

  /**
  * Deletes the account
  */
  handleDelete = () => {
    mailboxActions.remove(this.props.match.params.mailboxId)
    this.handleClose()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { open, mailbox, userHasServices } = this.state
    if (!mailbox) { return false }

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <p className={classes.message}>
            {userHasServices && mailbox.enabledServices.length > 1 ? (
              `Are you sure you want to delete this account (including ${mailbox.enabledServices.length} services)?`
            ) : (
              `Are you sure you want to delete this account?`
            )}
          </p>
          <div className={classes.avatarContainer}>
            <MailboxAvatar
              mailboxId={mailbox.id}
              size={45}
              className={classes.avatar} />
            <div className={classes.accountName}>
              {`${mailbox.humanizedType} : ${mailbox.displayName}`}
            </div>
          </div>
          {userHasServices && mailbox.enabledServices.length > 1 ? (
            <div className={classes.servicesContainer}>
              {mailbox.enabledServices.map((service) => {
                return (
                  <MailboxServiceIcon
                    key={service.type}
                    className={classes.serviceLogo}
                    iconUrl={Resolver.image(service.humanizedLogoAtSize(128))}
                    showSleeping={false}
                    size={32} />
                )
              })}
            </div>
          ) : undefined}
        </DialogContent>
        <DialogActions>
          <Button className={classes.cancelButton} onClick={this.handleClose}>
            Cancel
          </Button>
          <Button className={classes.deleteButton} variant='raised' onClick={this.handleDelete}>
            <DeleteIcon className={classes.deleteIcon} />
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default MailboxDeleteScene
