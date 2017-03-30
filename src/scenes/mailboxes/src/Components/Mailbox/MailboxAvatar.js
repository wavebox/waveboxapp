const React = require('react')
const { Avatar } = require('material-ui')
const { mailboxStore } = require('stores/mailbox')
const shallowCompare = require('react-addons-shallow-compare')
const CoreMailbox = require('shared/Models/Accounts/CoreMailbox')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxAvatar',
  propTypes: Object.assign({
    mailbox: React.PropTypes.object.isRequired
  }, Avatar.propTypes),
  getDefaultProps () {
    return {
      size: Avatar.defaultProps.size,
      color: 'white'
    }
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxUpdated)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxUpdated)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailbox !== nextProps.mailbox) {
      this.replaceState(this.getInitialState(nextProps))
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    const { mailbox } = props

    if (mailbox.hasCustomAvatar) {
      const mailboxState = mailboxStore.getState()
      return { url: mailboxState.getAvatar(mailbox.customAvatarId) }
    } else if (mailbox.avatarURL) {
      return { url: mailbox.avatarURL }
    } else if (!mailbox.avatarCharacterDisplay) {
      if (mailbox.humanizedLogo) {
        return { url: '../../' + mailbox.humanizedLogo }
      } else if (mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo) {
        return { url: '../../' + mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo }
      }
    }

    return { url: undefined }
  },

  mailboxUpdated (mailboxState) {
    this.setState(this.getInitialState())
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { url } = this.state
    const { style, backgroundColor, mailbox, size, ...passProps } = this.props

    if (backgroundColor) {
      passProps.backgroundColor = backgroundColor
    } else {
      passProps.backgroundColor = mailbox.hasCustomAvatar || mailbox.avatarURL ? 'white' : mailbox.color
    }
    passProps.style = Object.assign({
      borderWidth: size * 0.08,
      borderStyle: 'solid',
      borderColor: mailbox.color
    }, style)
    passProps.draggable = false
    passProps.size = size

    if (url) {
      return (<Avatar {...passProps} src={url} />)
    } else if (mailbox.avatarCharacterDisplay) {
      return (<Avatar {...passProps}>{mailbox.avatarCharacterDisplay}</Avatar>)
    } else {
      return (<Avatar {...passProps} />)
    }
  }
})
