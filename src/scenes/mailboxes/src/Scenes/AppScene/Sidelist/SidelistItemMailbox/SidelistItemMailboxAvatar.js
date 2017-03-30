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

    return (
      <MailboxAvatar
        {...passProps}
        mailbox={mailbox}
        size={50}
        style={Object.assign({
          borderColor: isActive || isHovering ? mailbox.color : Color(mailbox.color).lighten(0.4).rgb().string()
        }, styles.mailboxAvatar)} />
    )
  }
})
