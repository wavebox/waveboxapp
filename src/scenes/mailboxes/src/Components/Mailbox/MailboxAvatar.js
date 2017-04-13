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
    mailbox: React.PropTypes.object.isRequired,
    useBorderHack: React.PropTypes.bool.isRequired
  }, Avatar.propTypes),
  getDefaultProps () {
    return {
      size: Avatar.defaultProps.size,
      color: 'white',
      useBorderHack: true
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
    const { style, backgroundColor, mailbox, size, useBorderHack, ...passProps } = this.props

    passProps.draggable = false
    passProps.style = Object.assign({}, style)
    if (backgroundColor) {
      passProps.backgroundColor = backgroundColor
    } else {
      passProps.backgroundColor = mailbox.hasCustomAvatar || mailbox.avatarURL ? 'white' : mailbox.color
    }

    if (useBorderHack) {
      // Use a box shadow hack rather than border to fix a phantom white line
      // https://stackoverflow.com/questions/31805296/why-do-i-get-a-faint-border-around-css-circles-in-internet-explorer
      // This has the side effect of now overflowing the element, so try to be a bit intelligent about
      // reducing the size depending on the passed props
      if (style.boxShadow) {
        passProps.size = size
      } else {
        const borderSize = Math.round(size * 0.08)
        passProps.style.boxShadow = `0 0 0 ${borderSize}px ${mailbox.color}`
        passProps.size = size - (2 * borderSize)
      }
    } else {
      passProps.size = size
      passProps.style.border = `${size * 0.08}px solid ${mailbox.color}`
    }

    if (url) {
      return (<Avatar {...passProps} src={url} />)
    } else if (mailbox.avatarCharacterDisplay) {
      return (<Avatar {...passProps}>{mailbox.avatarCharacterDisplay}</Avatar>)
    } else {
      return (<Avatar {...passProps} />)
    }
  }
})
