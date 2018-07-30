import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import { emblinkActions } from 'stores/emblink'
import { ListSubheader, ListItem } from '@material-ui/core'
import UnreadMailboxMessageListItem from './UnreadMailboxMessageListItem'
import { ipcRenderer } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'
import grey from '@material-ui/core/colors/grey'
import pluralize from 'pluralize'

const styles = {
  subheader: {
    borderBottom: `1px solid ${grey[200]}`,
    lineHeight: '20px',
    paddingTop: 16,
    paddingBottom: 8
  },
  noneListItem: {
    borderBottom: `1px solid ${grey[100]}`,
    fontSize: '75%'
  },
  noneListHelperText: {
    marginLeft: 6,
    color: grey[400]
  }
}

@withStyles(styles)
class UnreadServiceListItem extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateAccountState(nextProps.mailboxId, nextProps.serviceId))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateAccountState(this.props.mailboxId, this.props.serviceId)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState(this.generateAccountState(this.props.mailboxId, this.props.serviceId, mailboxState))
  }

  /**
  * Generates the mailbox state
  * @param mailboxId: the id of the mailbox
  * @param serviceId: the id of the service
  * @param accountState=autoget: the current store state
  * @return the mailbox state
  */
  generateAccountState (mailboxId, serviceId, accountState = accountStore.getState()) {
    const service = accountState.getService(serviceId)
    const serviceData = accountState.getServiceData(serviceId)

    const messages = service && serviceData ? serviceData.getTrayMessages(service) : []
    return {
      displayName: accountState.resolvedServiceDisplayName(serviceId),
      messages: messages,
      messagesSignature: messages.map((m, i) => `${i}:${m.id}`).join(':'),
      ...(service && serviceData ? {
        unreadCount: service.supportsUnreadCount ? serviceData.getUnreadCount(service) : 0,
        hasUnreadActivity: service.supportsUnreadActivity ? serviceData.getHasUnreadActivity(service) : false
      } : {
        unreadCount: 0,
        hasUnreadActivity: false
      })
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles opening a message
  * @param evt: the event that fired
  * @param message: the message to open
  */
  handleOpenMessage = (evt, message) => {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
    emblinkActions.openItem(message.data.serviceId, message.data)
    accountActions.changeActiveService(message.data.serviceId)
  }

  /**
  * Switches to the service
  * @param evt: the event that fired
  */
  handleSwitchToService = (evt) => {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
    accountActions.changeActiveService(this.props.serviceId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare({
      props: this.props,
      state: {
        ...this.state,
        messages: undefined
      }
    },
    nextProps, {
      ...nextState,
      messages: undefined
    })
  }

  /**
  * Renders the no messages list item text
  * @param classes: the classes to style with
  * @param unreadCount: the unread count
  * @param hasUnreadActivity: if it has unread activity
  * @return jsx text that can be used
  */
  renderNoMessagesText (classes, unreadCount, hasUnreadActivity) {
    if (unreadCount > 0) {
      return (
        <React.Fragment>
          <span>
            {`${unreadCount} unread ${pluralize('item', unreadCount)}`}
            <span className={classes.noneListHelperText}>(no more information)</span>
          </span>
        </React.Fragment>
      )
    } else if (hasUnreadActivity) {
      return (
        <React.Fragment>
          <span>
            Unread activity
            <span className={classes.noneListHelperText}>(no more information)</span>
          </span>
        </React.Fragment>
      )
    } else {
      return 'No items'
    }
  }

  render () {
    const { classes } = this.props
    const {
      displayName,
      messages,
      unreadCount,
      hasUnreadActivity
    } = this.state

    return (
      <React.Fragment>
        <ListSubheader
          disableSticky
          className={classes.subheader}>
          {displayName}
        </ListSubheader>
        {messages.length ? (
          messages.map((message, index) => {
            return (
              <UnreadMailboxMessageListItem
                key={`${message.id}:${index}`}
                message={message}
                onClick={(evt) => { this.handleOpenMessage(evt, message) }} />
            )
          })
        ) : (
          <ListItem
            button
            className={classes.noneListItem}
            onClick={this.handleSwitchToService}>
            {this.renderNoMessagesText(classes, unreadCount, hasUnreadActivity)}
          </ListItem>
        )}
      </React.Fragment>
    )
  }
}

export default UnreadServiceListItem
