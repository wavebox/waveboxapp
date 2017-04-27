import PropTypes from 'prop-types'
import React from 'react'
import * as Colors from 'material-ui/styles/colors'
import MailboxToolbarServices from './MailboxToolbarServices'

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

export default class MailboxToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    toolbarHeight: PropTypes.number.isRequired
  }

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
}
