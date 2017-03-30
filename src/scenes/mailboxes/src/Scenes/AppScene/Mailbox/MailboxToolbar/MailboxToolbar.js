const React = require('react')
const Colors = require('material-ui/styles/colors')
const MailboxToolbarServices = require('./MailboxToolbarServices')

const styles = {
  toolbar: {
    backgroundColor: Colors.blueGrey900,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 100,
    WebkitAppRegion: 'drag'
  },
  services: {

  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxToolbar',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired,
    toolbarHeight: React.PropTypes.number.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, mailboxId, toolbarHeight, ...passProps } = this.props
    const saltedStyle = Object.assign({ height: toolbarHeight }, styles.toolbar, style)

    return (
      <div {...passProps} style={saltedStyle}>
        <MailboxToolbarServices mailboxId={mailboxId} toolbarHeight={toolbarHeight} />
      </div>
    )
  }
})
