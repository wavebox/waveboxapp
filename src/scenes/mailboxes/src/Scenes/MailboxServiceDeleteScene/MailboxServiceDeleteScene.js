import React from 'react'
import { Button, Dialog, DialogContent, DialogActions, DialogTitle } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import PropTypes from 'prop-types'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import ServiceAvatar from 'Components/Backed/ServiceAvatar'
import { withStyles } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import grey from '@material-ui/core/colors/grey'
import DeleteIcon from '@material-ui/icons/Delete'

const styles = {
  dialogContent: {
    width: 600
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  compositeAvatar: {
    width: 45,
    height: 45,
    position: 'relative',
    margin: '10px 20px 10px 10px'
  },
  serviceLogo: {
    position: 'absolute',
    bottom: -7,
    right: -7
  },
  message: {
    fontWeight: 'bold'
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
  serviceName: {
    color: grey[700]
  }
}

@withStyles(styles)
class MailboxServiceDeleteScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxId: PropTypes.string.isRequired,
        serviceId: PropTypes.string.isRequired
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
      const serviceId = nextProps.match.params.serviceId
      const accountState = accountStore.getState()
      this.setState({
        serviceDisplayName: accountState.resolvedServiceDisplayName(serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const serviceId = this.props.match.params.serviceId
    const accountState = accountStore.getState()
    return {
      open: true,
      serviceDisplayName: accountState.resolvedServiceDisplayName(serviceId)
    }
  })()

  accountChanged = (accountState) => {
    const serviceId = this.props.match.params.serviceId
    this.setState({
      serviceDisplayName: accountState.resolvedServiceDisplayName(serviceId)
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
    accountActions.removeService(
      this.props.match.params.serviceId
    )
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
    const { mailboxId, serviceId } = this.props.match.params
    const { open, serviceDisplayName } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <p className={classes.message}>
            {`Are you sure you want to delete ${serviceDisplayName} from this account?`}
          </p>
          <div className={classes.avatarContainer}>
            <div className={classes.compositeAvatar}>
              <MailboxAvatar
                mailboxId={mailboxId}
                size={45}
                className={classes.avatar} />
              <ServiceAvatar
                serviceId={serviceId}
                className={classes.serviceLogo}
                showSleeping={false}
                size={32} />
            </div>
            <div className={classes.serviceName}>
              {serviceDisplayName}
            </div>
          </div>
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

export default MailboxServiceDeleteScene
