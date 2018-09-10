import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import { List, Divider } from '@material-ui/core'
import UnreadMailboxControlListItem from './UnreadMailboxControlListItem'
import UnreadServiceListItem from './UnreadServiceListItem'
import { ipcRenderer } from 'electron'
import {
  WB_FOCUS_MAILBOXES_WINDOW
} from 'shared/ipcEvents'
import StyleMixins from 'wbui/Styles/StyleMixins'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  list: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'white'
  }
}

@withStyles(styles)
class UnreadMailbox extends React.Component {
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
    accountStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.mailboxesChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateAccountState(nextProps.mailboxId))
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateAccountState(this.props.mailboxId)
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState(this.generateAccountState(this.props.mailboxId, mailboxState))
  }

  /**
  * Generates the mailbox state
  * @param mailboxId: the id of the mailbox
  * @param accountState=autoget: the current store state
  * @return the mailbox state
  */
  generateAccountState (mailboxId, accountState = accountStore.getState()) {
    return {
      serviceIds: accountState.unrestrictedMailboxServiceIds(mailboxId)
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
    accountActions.changeActiveMailbox(this.props.mailboxId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { requestShowMailboxList, mailboxId, classes, className, ...passProps } = this.props
    const { serviceIds } = this.state

    return (
      <div className={classNames(className, classes.main)} {...passProps}>
        <List className={classes.list}>
          <UnreadMailboxControlListItem
            mailboxId={mailboxId}
            requestShowMailboxList={requestShowMailboxList}
            requestSwitchMailbox={this.handleRequestSwitchMailbox} />
          <Divider />
          {serviceIds.map((serviceId) => {
            return (
              <UnreadServiceListItem
                mailboxId={mailboxId}
                serviceId={serviceId}
                key={serviceId} />
            )
          })}
        </List>
      </div>
    )
  }
}

export default UnreadMailbox
