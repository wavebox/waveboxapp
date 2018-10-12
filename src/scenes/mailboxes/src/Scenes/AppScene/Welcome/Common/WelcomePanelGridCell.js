import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    padding: '48px !important',
    zIndex: 1,
    textAlign: 'center',
    '@media (max-width: 930px)': {
      padding: '48px 12px !important'
    }
  }
}

@withStyles(styles)
class WelcomePanelGridCell extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, children, ...passProps } = this.props

    return (
      <Grid item xs={6} className={classNames(className, classes.root)} {...passProps}>
        {children}
      </Grid>
    )
  }
}

export default WelcomePanelGridCell
