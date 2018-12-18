import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  mailboxContainer: {
    display: 'block',
    marginTop: 5,
    marginBottom: 5,
    position: 'relative',
    textAlign: 'center',
    WebkitAppRegion: 'no-drag' // on win32 when the titlebar is hidden, drag regions gobble hover events and cause popups to close early
  }
}

@withStyles(styles)
class SidelistMailboxContainer extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      className,
      children,
      ...passProps
    } = this.props

    return (
      <div className={classNames(classes.mailboxContainer, 'WB-SidelistItem', className)} {...passProps}>
        {children}
      </div>
    )
  }
}

export default SidelistMailboxContainer
