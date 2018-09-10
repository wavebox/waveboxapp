import React from 'react'
import PropTypes from 'prop-types'
import { accountStore } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import Resolver from 'Runtime/Resolver'
import ACAvatarCircle from 'wbui/ACAvatarCircle'

export default class MailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired
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
      <ACAvatarCircle
        avatar={avatar}
        resolver={(i) => Resolver.image(i)}
        {...passProps} />
    )
  }
}
