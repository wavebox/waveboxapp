import React from 'react'
import { Dialog, DialogTitle, DialogActions, Button, List, ListItem, DialogContent, ListItemText, ListItemAvatar } from 'material-ui'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { mailboxStore, mailboxActions, mailboxDispatch } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import { withStyles } from 'material-ui/styles'

const KEYBOARD_UNSELECTED_INDEX = -1

const styles = {
  dialogContent: {
    padding: 0
  },
  keyboardFocus: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  }
}

@withStyles(styles)
class ComposePickerScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
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
      evt.preventDefault()
      evt.stopPropagation()
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
        return { keyboardIndex: nextIndex }
      })
    } else if (evt.keyCode === 13) {
      evt.preventDefault()
      evt.stopPropagation()
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
    const { classes } = this.props
    const { composeServices, open, mailboxes, keyboardIndex } = this.state

    return (
      <Dialog open={open} onClose={this.handleCancel}>
        <DialogTitle>
          Compose New Message
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List>
            {composeServices.map((service, index) => {
              const mailbox = mailboxes[service.parentId]
              return (
                <ListItem
                  key={`${mailbox.id}:${service.type}`}
                  tabIndex={-1}
                  button
                  onClick={(evt) => this.handleSelectService(evt, service)}
                  className={index === keyboardIndex ? classes.keyboardFocus : undefined}>
                  <ListItemAvatar>
                    <MailboxAvatar mailboxId={mailbox.id} />
                  </ListItemAvatar>
                  <ListItemText primary={mailbox.displayName} secondary={service.humanizedType} />
                </ListItem>)
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button variant='raised' onClick={this.handleCancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ComposePickerScene
