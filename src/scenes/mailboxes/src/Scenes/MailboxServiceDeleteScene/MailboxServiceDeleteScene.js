import React from 'react'
import { RaisedButton, Dialog, FlatButton, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions, MailboxReducer } from 'stores/mailbox'
import * as Colors from 'material-ui/styles/colors'
import PropTypes from 'prop-types'
import { MailboxAvatar } from 'Components/Mailbox'
import Resolver from 'Runtime/Resolver'

const styles = {
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
    right: -7,
    height: 32
  },
  message: {
    fontWeight: 'bold'
  }
}

export default class MailboxServiceDeleteScene extends React.Component {
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
        serviceType: PropTypes.string.isRequired
      })
    })
  }
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.mailboxId !== nextProps.match.params.mailboxId) {
      const mailbox = mailboxStore.getState().getMailbox(nextProps.match.params.mailboxId)
      this.setState({
        mailbox: mailbox,
        service: mailbox ? mailbox.serviceForType(this.props.match.params.serviceType) : null
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(this.props.match.params.mailboxId)
    return {
      open: true,
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(this.props.match.params.serviceType) : null
    }
  })()

  mailboxChanged = (mailboxState) => {
    const mailbox = mailboxState.getMailbox(this.props.match.params.mailboxId)
    this.setState({
      mailbox: mailbox,
      service: mailbox ? mailbox.serviceForType(this.props.match.params.serviceType) : null
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
    mailboxActions.reduce(
      this.props.match.params.mailboxId,
      MailboxReducer.removeService,
      this.props.match.params.serviceType
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
    const { open, mailbox, service } = this.state
    if (!mailbox || !service) { return false }

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
        title='Delete Service'
        actions={actions}
        open={open}>
        <p style={styles.message}>
          {`Are you sure you want to delete ${service.humanizedType} from this account?`}
        </p>
        <div style={styles.avatarContainer}>
          <div style={styles.compositeAvatar}>
            <MailboxAvatar
              mailboxId={mailbox.id}
              size={45}
              style={styles.avatar} />
            <img
              src={Resolver.image(service.humanizedLogoAtSize(128))}
              style={styles.serviceLogo} />
          </div>
          <div>
            {`${service.humanizedType} : ${mailbox.displayName}`}
          </div>
        </div>
      </Dialog>
    )
  }
}
