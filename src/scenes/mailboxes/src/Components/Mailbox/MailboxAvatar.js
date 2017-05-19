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
    return { url: mailboxStore.getState().getResolvedAvatar(mailbox.id) }
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

  /**
  * Renders the styles
  * @param mailbox: the mailbox to render for
  * @param size: the size of the avatar
  * @param componentStyles: the current style set provided to this component
  * @param useBorderHack: true if we're using the border hack
  * @return { size, styles }
  */
  renderStyles (mailbox, size, componentStyles, useBorderHack) {
    let adjustedSize
    const style = { }

    if (useBorderHack) {
      // Use a box shadow hack rather than border to fix a phantom white line
      // https://stackoverflow.com/questions/31805296/why-do-i-get-a-faint-border-around-css-circles-in-internet-explorer
      // This has the side effect of now overflowing the element, so try to be a bit intelligent about
      // reducing the size depending on the passed props
      if (componentStyles.boxShadow) {
        adjustedSize = size
      } else {
        const borderSize = Math.round(size * 0.08)
        adjustedSize = size - (2 * borderSize)
        style.boxShadow = `0 0 0 ${borderSize}px ${mailbox.color}`
      }
    } else {
      adjustedSize = size
      style.border = `${size * 0.08}px solid ${mailbox.color}`
    }

    // Overwrite the values from above rather than conditionally setting them so that the on-screen size
    // of the avatar remains consistent for further styling
    if (mailbox.showAvatarColorRing === false) {
      style.boxShadow = 'none'
      style.border = 'none'
    }

    return { size: adjustedSize, style: style }
  }

  render () {
    const { url } = this.state
    const { style, mailbox, size, useBorderHack, ...otherProps } = this.props
    const passProps = Object.assign({
      draggable: false,
      style: Object.assign({}, style),
      backgroundColor: mailbox.hasCustomAvatar || mailbox.avatarURL ? 'white' : mailbox.color
    }, otherProps)

    const sizeAndBorder = this.renderStyles(mailbox, size, style, useBorderHack)
    passProps.size = sizeAndBorder.size
    passProps.style = Object.assign(passProps.style, sizeAndBorder.style)

    if (url) {
      return (<Avatar {...passProps} src={url} />)
    } else if (mailbox.avatarCharacterDisplay) {
      return (<Avatar {...passProps}>{mailbox.avatarCharacterDisplay}</Avatar>)
    } else {
      return (<Avatar {...passProps} />)
    }
  }
}
