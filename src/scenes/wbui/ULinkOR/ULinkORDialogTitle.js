import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogTitle, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  root: {
    paddingBottom: 0
  }
}

@withStyles(styles)
class ULinkORDialogTitle extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    targetUrl: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      targetUrl,
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <DialogTitle
        disableTypography
        className={classNames(classes.root, className)}
        {...passProps}>
        <Typography variant='h6'>Where would you like to open this link?</Typography>
        <Typography variant='body2' color='textSecondary' noWrap>{targetUrl}</Typography>
      </DialogTitle>
    )
  }
}

export default ULinkORDialogTitle
