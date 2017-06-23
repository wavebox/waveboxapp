import React from 'react'
import { Dialog, RaisedButton, List, ListItem } from 'material-ui'
import { composeStore, composeActions } from 'stores/compose'
import { mailboxStore } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import { MailboxAvatar } from 'Components/Mailbox'

export default class ComposePickerScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    composeStore.listen(this.composeChanged)
    mailboxStore.listen(this.mailboxChanged)
  }

  componentWillUnmount () {
    composeStore.unlisten(this.composeChanged)
    mailboxStore.unlisten(this.mailboxChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return Object.assign({
      open: true
    }, this.generateComposeData())
  })()

  /**
  * Generates the compose state from the two stores
  * @param mailboxState=autofetch: the current mailbox state
  * @param composeState=autofetch: the current compose state
  * @return an object with the compose portion of the state
  */
  generateComposeData (mailboxState = mailboxStore.getState(), composeState = composeStore.getState()) {
    return {
      composeProtocol: composeState.composeProtocol,
      mailboxes: mailboxState.allMailboxesIndexed(),
      composeServices: composeState.composeProtocol ? mailboxState.getServicesSupportingProtocol(composeState.composeProtocol) : mailboxState.getServicesSupportingCompose()
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
    setTimeout(() => { composeActions.cancelCompose() }, 500)
  }

  /**
  * Handles selecting the service
  * @param evt: the event that fired
  * @param servive: the servie that was selected
  */
  handleSelectService = (evt, service) => {
    this.setState({ open: false })
    setTimeout(() => { composeActions.composeMessageInMailbox(service.parentId, service.type) }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { composeServices, open, mailboxes } = this.state

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
        autoScrollBodyContent
        onRequestClose={this.handleCancel}>
        <List>
          {composeServices.map((service) => {
            const mailbox = mailboxes[service.parentId]
            return (
              <ListItem
                key={`${service.parentId}:${service.type}`}
                leftAvatar={<MailboxAvatar mailbox={mailbox} />}
                primaryText={mailbox.displayName}
                secondaryText={service.humanizedType}
                onClick={(evt) => this.handleSelectService(evt, service)} />)
          })}
        </List>
      </Dialog>
    )
  }
}
