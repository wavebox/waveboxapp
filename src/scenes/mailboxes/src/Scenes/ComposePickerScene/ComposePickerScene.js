import React from 'react'
import { Dialog, RaisedButton, List, ListItem } from 'material-ui'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import { MailboxAvatar } from 'Components/Mailbox'
import uuid from 'uuid'

const KEYBOARD_UNSELECTED_INDEX = -1
const LIST_ITEM_HEIGHT = 72

export default class ComposePickerScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.dialogBodyClassName = `ReactComponent-DialogBody-${uuid.v4()}`
    emblinkStore.listen(this.composeChanged)
    mailboxStore.listen(this.mailboxChanged)
    window.addEventListener('keydown', this.handleKeypress)
  }

  componentWillUnmount () {
    emblinkStore.unlisten(this.composeChanged)
    mailboxStore.unlisten(this.mailboxChanged)
    window.removeEventListener('keydown', this.handleKeypress)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return Object.assign({
      open: true,
      keyboardIndex: KEYBOARD_UNSELECTED_INDEX
    }, this.generateComposeData())
  })()

  /**
  * Generates the compose state from the two stores
  * @param mailboxState=autofetch: the current mailbox state
  * @param composeState=autofetch: the current compose state
  * @return an object with the compose portion of the state
  */
  generateComposeData (mailboxState = mailboxStore.getState(), composeState = emblinkStore.getState()) {
    return {
      mailboxes: mailboxState.allMailboxesIndexed(),
      composeServices: mailboxState.getServicesSupportingCompose(),
      composePayload: composeState.compose.payload
    }
  }

  composeChanged = (composeState) => {
    this.setState(this.generateComposeData(undefined, composeState))
  }

  mailboxChanged = (mailboxState) => {
    this.setState(this.generateComposeData(mailboxState, undefined))
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Dismisses the compose actions
  * @param evt: the event that fired
  */
  handleCancel = (evt) => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
      emblinkActions.clearCompose()
    }, 500)
  }

  /**
  * Handles selecting the service
  * @param evt: the event that fired
  * @param servive: the servie that was selected
  */
  handleSelectService = (evt, service) => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
      mailboxActions.changeActive(service.parentId, service.type)
      mailboxDispatch.composeItem(service.parentId, service.type, this.state.composePayload || {})
      emblinkActions.clearCompose()
    }, 250)
  }

  /**
  * Handles an incoming keypress
  * @param evt: the event that fired
  */
  handleKeypress = (evt) => {
    if (evt.keyCode === 38 || evt.keyCode === 40) {
      this.setState((prevState) => {
        let nextIndex
        if (prevState.keyboardIndex === KEYBOARD_UNSELECTED_INDEX) {
          nextIndex = 0
        } else {
          if (evt.keyCode === 38) {
            if (prevState.keyboardIndex - 1 < 0) {
              nextIndex = prevState.composeServices.length - 1
            } else {
              nextIndex = prevState.keyboardIndex - 1
            }
          } else {
            if (prevState.keyboardIndex + 1 >= prevState.composeServices.length) {
              nextIndex = 0
            } else {
              nextIndex = prevState.keyboardIndex + 1
            }
          }
        }

        setTimeout(() => {
          document.querySelector(`.${this.dialogBodyClassName}`).scrollTop = nextIndex * LIST_ITEM_HEIGHT
        })
        return { keyboardIndex: nextIndex }
      })
    } else if (evt.keyCode === 13) {
      if (this.state.keyboardIndex !== KEYBOARD_UNSELECTED_INDEX) {
        this.handleSelectService(evt, this.state.composeServices[this.state.keyboardIndex])
      }
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { composeServices, open, mailboxes, keyboardIndex } = this.state

    const actions = (
      <RaisedButton label='Cancel' onClick={this.handleCancel} />
    )

    return (
      <Dialog
        modal={false}
        title='Compose New Message'
        titleStyle={{ lineHeight: '22px' }}
        actions={actions}
        open={open}
        contentStyle={{ maxWidth: 'none', width: 320 }}
        bodyStyle={{ padding: 0 }}
        bodyClassName={this.dialogBodyClassName}
        autoScrollBodyContent
        onRequestClose={this.handleCancel}>
        <List>
          {composeServices.map((service, index) => {
            const mailbox = mailboxes[service.parentId]
            return (
              <ListItem
                disableKeyboardFocus
                key={`${service.parentId}:${service.type}`}
                style={index === keyboardIndex ? { backgroundColor: 'rgba(0, 0, 0, 0.1)' } : undefined}
                leftAvatar={<MailboxAvatar mailboxId={mailbox.id} />}
                primaryText={mailbox.displayName}
                secondaryText={service.humanizedType}
                onClick={(evt) => this.handleSelectService(evt, service)} />)
          })}
        </List>
      </Dialog>
    )
  }
}
