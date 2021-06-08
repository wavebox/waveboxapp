import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    position: 'relative'
  }
}

@withStyles(styles)
class WelcomePanelGrid extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, children, ...passProps } = this.props

    return (
      <Grid container className={classNames(classes.root, className)} {...passProps}>
        {children}
      </Grid>
    )
  }
}

export default WelcomePanelGrid
