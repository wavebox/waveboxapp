import React from 'react'
import { ListItem } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    '&:hover:not(:focus)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  }
}

@withStyles(styles)
class ULinkORListItem extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <ListItem
        button
        data-ulinkor-keyboard-target='true'
        className={classNames(className, classes.root)}
        {...passProps} />
    )
  }
}

export default ULinkORListItem
