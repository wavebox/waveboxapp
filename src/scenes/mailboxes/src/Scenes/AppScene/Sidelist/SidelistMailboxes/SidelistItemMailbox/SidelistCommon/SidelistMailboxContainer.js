import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  mailboxContainer: {
    display: 'block',
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
    textAlign: 'center'
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
      <div className={classNames(classes.mailboxContainer, 'WB-SidelistItemMailbox', className)} {...passProps}>
        {children}
      </div>
    )
  }
}

export default SidelistMailboxContainer
