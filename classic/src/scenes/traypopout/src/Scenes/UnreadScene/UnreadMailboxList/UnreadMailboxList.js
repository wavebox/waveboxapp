import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore, accountActions } from 'stores/account'
import { List, Divider } from '@material-ui/core'
import UnreadMailboxListItem from './UnreadMailboxListItem'
import { WB_FOCUS_MAILBOXES_WINDOW } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'

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
    paddingBottom: 0
  },
  noneItem: {
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 14,
    cursor: 'default'
  }
}

@withStyles(styles)
class UnreadMailboxList extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    requestShowMailbox: PropTypes.func.isRequired
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

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = accountStore.getState()

    return {
      mailboxIds: mailboxState.mailboxIds()
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState({
      mailboxIds: mailboxState.mailboxIds()
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles showing a mailbox
  * @param evt: the event that fired
  * @param mailboxId: the id of the mailbox
  */
  handleRequestShowMailbox = (evt, mailboxId) => {
    this.props.requestShowMailbox(mailboxId)
  }

  /**
  * Handles switching to a mailbox
  * @param evt: the event that fired
  * @param mailboxId: the id of the mailbox
  */
  handleRequestSwitchMailbox = (evt, mailboxId) => {
    ipcRenderer.send(WB_FOCUS_MAILBOXES_WINDOW, {})
    accountActions.changeActiveMailbox(mailboxId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, classes, requestShowMailbox, ...passProps } = this.props
    const { mailboxIds } = this.state

    return (
      <div
        className={classNames(classes.main, className)}
        {...passProps}>
        <List className={classes.list}>
          {mailboxIds.length ? (
            mailboxIds.reduce((acc, id, index, arr) => {
              return acc.concat([
                (<UnreadMailboxListItem
                  key={id}
                  mailboxId={id}
                  requestShowMailbox={this.handleRequestShowMailbox}
                  requestSwitchMailbox={this.handleRequestSwitchMailbox} />
                ),
                index === arr.length - 1 ? undefined : (<Divider key={`inset-${id}`} />)
              ])
            }, [])
          ) : (
            <div className={classes.noneItem}>You haven't added any accounts yet</div>
          )}
        </List>
      </div>
    )
  }
}

export default UnreadMailboxList
