import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import styles from '../SidelistStyles'
import Color from 'color'
import { MailboxAvatar } from 'Components/Mailbox'

export default class SidelistItemMailboxAvatar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    isActive: PropTypes.bool.isRequired,
    isHovering: PropTypes.bool.isRequired,
    mailbox: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { isActive, isHovering, mailbox, ...passProps } = this.props
    delete passProps.index

    const borderColor = isActive || isHovering ? mailbox.color : Color(mailbox.color).lighten(0.4).rgb().string()
    return (
      <MailboxAvatar
        {...passProps}
        mailbox={mailbox}
        size={42}
        style={Object.assign({
          boxShadow: `0 0 0 4px ${borderColor}`,
          margin: 4
        }, styles.mailboxAvatar)} />
    )
  }
}
