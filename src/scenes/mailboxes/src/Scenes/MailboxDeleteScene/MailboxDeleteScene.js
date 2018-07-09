import React from 'react'
import { Button, Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import PropTypes from 'prop-types'
import ACAvatarCircle from 'wbui/ACAvatarCircle'
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
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.mailboxId !== nextProps.match.params.mailboxId) {
      const mailboxId = nextProps.match.params.mailboxId
      const accountState = accountStore.getState()
      this.setState({
        mailbox: accountState.getMailbox(mailboxId),
        services: accountState.mailboxServices(mailboxId),
        avatar: accountState.getMailboxAvatarConfig(mailboxId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxId = this.props.match.params.mailboxId
    const accountState = accountStore.getState()
    return {
      open: true,
      mailbox: accountState.getMailbox(mailboxId),
      services: accountState.mailboxServices(mailboxId),
      avatar: accountState.getMailboxAvatarConfig(mailboxId)
    }
  })()

  accountChanged = (accountState) => {
    const mailboxId = this.props.match.params.mailboxId
    this.setState({
      mailbox: accountState.getMailbox(mailboxId),
      services: accountState.mailboxServices(mailboxId),
      avatar: accountState.getMailboxAvatarConfig(mailboxId)
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
    accountActions.removeMailbox(this.props.match.params.mailboxId)
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
    const { open, mailbox, services, avatar } = this.state
    if (!mailbox) { return false }

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <p className={classes.message}>
            {mailbox.hasMultipleServices ? (
              `Are you sure you want to delete this account (including ${mailbox.allServiceCount} services)?`
            ) : (
              `Are you sure you want to delete this account?`
            )}
          </p>
          <div className={classes.avatarContainer}>
            <ACAvatarCircle
              avatar={avatar}
              resolver={(i) => Resolver.image(i)}
              size={45}
              className={classes.avatar} />
            <div className={classes.accountName}>
              {mailbox.displayName}
            </div>
          </div>
          {mailbox.hasMultipleServices ? (
            <div className={classes.servicesContainer}>
              {services.map((service) => {
                return (
                  <MailboxServiceIcon
                    key={service.id}
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
