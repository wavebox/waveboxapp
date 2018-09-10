import React from 'react'
import { Dialog, DialogTitle, DialogActions, Button, List, ListItem, DialogContent, ListItemText, ListItemAvatar } from '@material-ui/core'
import { emblinkStore, emblinkActions } from 'stores/emblink'
import { accountStore, accountActions, accountDispatch } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxAvatar from 'Components/Backed/MailboxAvatar'
import { withStyles } from '@material-ui/core/styles'
import SERVICE_TYPES from 'shared/Models/ACAccounts/ServiceTypes'

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
    accountStore.listen(this.accountChanged)
    window.addEventListener('keydown', this.handleKeypress)
  }

  componentWillUnmount () {
    emblinkStore.unlisten(this.composeChanged)
    accountStore.unlisten(this.accountChanged)
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
  * @param accountState=autofetch: the current account state
  * @param composeState=autofetch: the current compose state
  * @return an object with the compose portion of the state
  */
  generateComposeData (accountState = accountStore.getState(), composeState = emblinkStore.getState()) {
    return {
      composeServices: [].concat(
        accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_MAIL),
        accountState.allServicesOfType(SERVICE_TYPES.GOOGLE_INBOX),
        accountState.allServicesOfType(SERVICE_TYPES.MICROSOFT_MAIL)
      ),
      composePayload: composeState.compose.payload
    }
  }

  composeChanged = (composeState) => {
    this.setState(this.generateComposeData(undefined, composeState))
  }

  accountChanged = (accountState) => {
    this.setState(this.generateComposeData(accountState, undefined))
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
      accountActions.changeActiveService(service.id)
      accountDispatch.composeItem(service.id, this.state.composePayload || {})
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
    const { composeServices, open, keyboardIndex } = this.state

    return (
      <Dialog disableEnforceFocus open={open} onClose={this.handleCancel}>
        <DialogTitle>
          Compose New Message
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <List>
            {composeServices.map((service, index) => {
              return (
                <ListItem
                  key={service.id}
                  tabIndex={-1}
                  button
                  onClick={(evt) => this.handleSelectService(evt, service)}
                  className={index === keyboardIndex ? classes.keyboardFocus : undefined}>
                  <ListItemAvatar>
                    <MailboxAvatar mailboxId={service.parentId} />
                  </ListItemAvatar>
                  <ListItemText primary={service.displayName} secondary={service.humanizedType} />
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
