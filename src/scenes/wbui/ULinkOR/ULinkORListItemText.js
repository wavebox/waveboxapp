import React from 'react'
import { ListItemText } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  primary: {
    fontSize: '0.9rem !important'
  }
}

@withStyles(styles)
class ULinkORListItemText extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes, ...passProps } = this.props

    return (
      <ListItemText
        classes={{ primary: classes.primary }}
        {...passProps} />
    )
  }
}

export default ULinkORListItemText
