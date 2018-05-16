import React from 'react'
import { RaisedButton, Dialog, FlatButton, FontIcon } from 'material-ui' //TODO
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { userStore } from 'stores/user'
import * as Colors from 'material-ui/styles/colors' //TODO
import PropTypes from 'prop-types'
import { MailboxAvatar } from 'Components/Mailbox'
import Resolver from 'Runtime/Resolver'

const styles = {
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
    height: 32,
    marginLeft: 4,
    marginRight: 4
  }
}

export default class MailboxDeleteScene extends React.Component {
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
    const { open, mailbox, userHasServices } = this.state

    if (!mailbox) { return false }

    const actions = (
      <div>
        <FlatButton
          label='Cancel'
          style={{ marginRight: 8 }}
          onClick={this.handleClose} />
        <RaisedButton
          labelStyle={{ color: Colors.red600 }}
          label='Delete'
          icon={(<FontIcon className='material-icons' color={Colors.red600}>delete</FontIcon>)}
          onClick={this.handleDelete} />
      </div>
    )

    return (
      <Dialog
        onRequestClose={this.handleClose}
        title='Delete Account'
        actions={actions}
        open={open}>
        <p style={styles.message}>
          {userHasServices && mailbox.enabledServices.length > 1 ? (
            `Are you sure you want to delete this account (including ${mailbox.enabledServices.length} services)?`
          ) : (
            `Are you sure you want to delete this account?`
          )}
        </p>
        <div style={styles.avatarContainer}>
          <MailboxAvatar
            mailboxId={mailbox.id}
            size={45}
            style={styles.avatar} />
          <div>
            {`${mailbox.humanizedType} : ${mailbox.displayName}`}
          </div>
        </div>
        {userHasServices && mailbox.enabledServices.length > 1 ? (
          <div style={styles.servicesContainer}>
            {mailbox.enabledServices.map((service) => {
              return (
                <img
                  src={Resolver.image(service.humanizedLogoAtSize(128))}
                  style={styles.serviceLogo} />
              )
            })}
          </div>
        ) : undefined}
      </Dialog>
    )
  }
}
