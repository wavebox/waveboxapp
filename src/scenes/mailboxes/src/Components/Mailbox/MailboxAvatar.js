import React from 'react'
import PropTypes from 'prop-types'
import { Avatar } from 'material-ui'
import { mailboxStore } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import CoreMailbox from 'shared/Models/Accounts/CoreMailbox'

export default class MailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailbox: PropTypes.object.isRequired,
    useBorderHack: PropTypes.bool.isRequired,
    ...Avatar.propTypes
  }

  static defaultProps = {
    size: Avatar.defaultProps.size,
    color: 'white',
    useBorderHack: true
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
    if (this.props.mailbox !== nextProps.mailbox) {
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
  * @return state object
  */
  generateInitialState (props) {
    const { mailbox } = props

    if (mailbox.hasCustomAvatar) {
      const mailboxState = mailboxStore.getState()
      return { url: mailboxState.getAvatar(mailbox.customAvatarId) }
    } else if (mailbox.avatarURL) {
      return { url: mailbox.avatarURL }
    } else if (mailbox.hasServiceLocalAvatar) {
      const mailboxState = mailboxStore.getState()
      return { url: mailboxState.getAvatar(mailbox.serviceLocalAvatarId) }
    } else if (!mailbox.avatarCharacterDisplay) {
      if (mailbox.humanizedLogo) {
        return { url: '../../' + mailbox.humanizedLogo }
      } else if (mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo) {
        return { url: '../../' + mailbox.serviceForType(CoreMailbox.SERVICE_TYPES.DEFAULT).humanizedLogo }
      }
    }

    return { url: undefined }
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
    const { url } = this.state
    const { style, mailbox, size, useBorderHack, ...otherProps } = this.props
    const passProps = Object.assign({
      draggable: false,
      style: Object.assign({}, style),
      backgroundColor: mailbox.hasCustomAvatar || mailbox.avatarURL ? 'white' : mailbox.color
    }, otherProps)

    // Update the styles for the border
    if (mailbox.showAvatarColorRing) {
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
    } else {
      passProps.style.boxShadow = 'none'
      passProps.style.border = 'none'
      passProps.size = size
    }

    if (url) {
      return (<Avatar {...passProps} src={url} />)
    } else if (mailbox.avatarCharacterDisplay) {
      return (<Avatar {...passProps}>{mailbox.avatarCharacterDisplay}</Avatar>)
    } else {
      return (<Avatar {...passProps} />)
    }
  }
}
