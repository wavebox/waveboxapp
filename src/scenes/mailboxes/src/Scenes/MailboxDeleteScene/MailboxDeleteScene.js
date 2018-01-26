import React from 'react'
import { RaisedButton, Dialog, FlatButton, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import * as Colors from 'material-ui/styles/colors'
import PropTypes from 'prop-types'
import {MailboxAvatar} from 'Components/Mailbox'

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
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
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
      mailbox: mailboxState.getMailbox(this.props.match.params.mailboxId)
    }
  })()

  mailboxChanged = (mailboxState) => {
    this.setState({
      mailbox: mailboxState.getMailbox(this.props.match.params.mailboxId)
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
    const {
      open,
      mailbox
    } = this.state

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
        <p style={styles.message}>Are you sure you want to delete this account?</p>
        {mailbox ? (
          <div style={styles.avatarContainer}>
            <MailboxAvatar
              mailbox={mailbox}
              size={45}
              style={styles.avatar} />
            <div>
              {`${mailbox.humanizedType} : ${mailbox.displayName}`}
            </div>
          </div>
        ) : undefined}
      </Dialog>
    )
  }
}
