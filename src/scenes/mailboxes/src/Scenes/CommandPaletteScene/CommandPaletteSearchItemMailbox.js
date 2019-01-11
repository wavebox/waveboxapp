import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import CommandPaletteSearchItem from './CommandPaletteSearchItem'
import CommandPaletteSearchEngine from './CommandPaletteSearchEngine'

class CommandPaletteSearchItemMailbox extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    onOpenItem: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(
        this.generateMailboxState(nextProps.mailboxId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateMailboxState(this.props.mailboxId, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState(
      this.generateMailboxState(this.props.mailboxId, accountState)
    )
  }

  generateMailboxState (mailboxId, accountState) {
    return {
      primaryText: accountState.resolvedMailboxDisplayName(mailboxId)
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { mailboxId, onOpenItem, onClick } = this.props
    onOpenItem(evt, CommandPaletteSearchEngine.SEARCH_TARGETS.MAILBOX, mailboxId)
    if (onClick) {
      onClick(evt)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      primaryText
    } = this.state
    const {
      mailboxId,
      onOpenItem,
      onClick,
      ...passProps
    } = this.props

    return (
      <CommandPaletteSearchItem
        onClick={this.handleClick}
        primaryText={primaryText}
        secondaryText='MAILBOX'
        {...passProps} />
    )
  }
}

export default CommandPaletteSearchItemMailbox
