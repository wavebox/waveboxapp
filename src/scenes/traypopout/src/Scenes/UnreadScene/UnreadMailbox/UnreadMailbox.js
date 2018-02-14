import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import { emblinkActions } from 'stores/emblink'
import { List, ListItem, Divider } from 'material-ui'
import UnreadMailboxControlListItem from './UnreadMailboxControlListItem'
import { ipcRenderer } from 'electron'
import {
  WB_FOCUS_MAILBOXES_WINDOW
} from 'shared/ipcEvents'

const styles = {
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflowY: 'auto'
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0
  },
  listItem: {
    paddingTop: 8,
    paddingBottom: 8
  },
  primaryMessageText: {
    fontSize: 14
  },
  secondaryMessageText: {
    fontSize: 13
  }
}

export default class UnreadMailbox extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    requestShowMailboxList: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateMailboxState(nextProps.mailboxId))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateMailboxState(this.props.mailboxId)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState(this.generateMailboxState(this.props.mailboxId, mailboxState))
  }

  /**
  * Generates the mailbox state
  * @param mailboxId: the id of the mailbox
  * @param mailboxState=autoget: the current store state
  * @return the mailbox state
  */
  generateMailboxState (mailboxId, mailboxState = mailboxStore.getState()) {
    const trayMessages = mailboxState.mailboxTrayMessagesForUser(mailboxId)

    return {
      messagesSignature: trayMessages.map((message) => message.id).join(':'),
      messages: trayMessages
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles switching to a mailbox
  * @param evt: the event that fired
  */
  handleRequestSwitchMailbox = (evt) => {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
    mailboxActions.changeActive(this.props.mailboxId)
  }

  /**
  * Handles opening a message
  * @param evt: the event that fired
  * @param message: the message to open
  */
  handleOpenMessage = (evt, message) => {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
    emblinkActions.openItem(message.data.mailboxId, message.data.serviceType, message.data)
    mailboxActions.changeActive(this.props.mailboxId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.messagesSignature !== nextState.messagesSignature) { return true }

    return shallowCompare({ props: this.props, state: null }, nextProps, null)
  }

  render () {
    const { requestShowMailboxList, mailboxId, style, ...passProps } = this.props
    const { messages } = this.state

    return (
      <div style={{...styles.main, ...style}} {...passProps}>
        <List style={styles.list}>
          <UnreadMailboxControlListItem
            mailboxId={mailboxId}
            requestShowMailboxList={requestShowMailboxList}
            requestSwitchMailbox={this.handleRequestSwitchMailbox} />
          <Divider />
          {messages.length ? (
            messages.map((message, index) => {
              if (message.textSplit && message.textSplit.length) {
                return (
                  <ListItem
                    key={`${message.id}:${index}`}
                    innerDivStyle={styles.listItem}
                    primaryText={(
                      <div style={styles.primaryMessageText}>{message.textSplit[0]}</div>
                    )}
                    secondaryText={(
                      <div style={styles.secondaryMessageText}>{message.textSplit.slice(1).join('\n')}</div>
                    )}
                    onClick={(evt) => { this.handleOpenMessage(evt, message) }}
                  />)
              } else {
                return (
                  <ListItem
                    key={`${message.id}:${index}`}
                    primaryText={(
                      <span style={styles.primaryMessageText}>{message.text}</span>
                    )}
                    onClick={(evt) => { this.handleOpenMessage(evt, message) }}
                  />)
              }
            })
          ) : (
            <ListItem primaryText='No Messages' disabled />
          )}
        </List>
      </div>
    )
  }
}
