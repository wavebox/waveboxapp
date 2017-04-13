const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const styles = require('../SidelistStyles')
const {
  Mailbox: { MailboxAvatar }
} = require('Components')
const Color = require('color')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailboxAvatar',
  propTypes: {
    isActive: React.PropTypes.bool.isRequired,
    isHovering: React.PropTypes.bool.isRequired,
    mailbox: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

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
})
