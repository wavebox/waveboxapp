import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import Resolver from 'Runtime/Resolver'
import SharedMailboxAvatar from 'wbui/MailboxAvatar'

//TODO depricate me?
export default class MailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = (() => {
    const props = {
      mailboxId: PropTypes.string.isRequired,
      ...SharedMailboxAvatar.propTypes
    }
    delete props.mailbox
    delete props.resolvedAvatar
    return props
  })()

  static defaultProps = {
    ...SharedMailboxAvatar.defaultProps
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState({
        avatar: accountStore.getState().getMailboxAvatarConfig(nextProps.mailboxId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      avatar: accountStore.getState().getMailboxAvatarConfig(this.props.mailboxId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      avatar: accountState.getMailboxAvatarConfig(this.props.mailboxId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, ...passProps } = this.props
    const { avatar } = this.state

    return (
      <SharedMailboxAvatar
        avatar={avatar}
        resolver={(i) => Resolver.image(i)}
        {...passProps} />
    )
  }
}
