import React from 'react'
import PropTypes from 'prop-types'
import { mailboxStore } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import Resolver from 'Runtime/Resolver'
import SharedMailboxAvatar from 'sharedui/Components/Mailbox/MailboxAvatar'

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
    mailboxStore.listen(this.mailboxUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      this.setState(this.generateInitialState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = this.generateInitialState(this.props)

  /**
  * Generates the state for the given props
  * @param props: the props to generate state for
  * @param mailboxState=autoget: the mailbox state
  * @return state object
  */
  generateInitialState (props, mailboxState = mailboxStore.getState()) {
    const { mailboxId } = props
    return {
      mailbox: mailboxState.getMailbox(mailboxId),
      url: mailboxState.getResolvedAvatar(mailboxId, (i) => Resolver.image(i))
    }
  }

  mailboxUpdated = (mailboxState) => {
    this.setState(this.generateInitialState(this.props))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailbox, url } = this.state
    const { mailboxId, ...passProps } = this.props
    return (
      <SharedMailboxAvatar
        mailbox={mailbox}
        resolvedAvatar={url}
        {...passProps} />
    )
  }
}
