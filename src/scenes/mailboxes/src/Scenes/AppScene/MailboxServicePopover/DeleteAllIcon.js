import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import DeleteIcon from '@material-ui/icons/Delete'
import classNames from 'classnames'

const styles = {
  wrapper: {
    width: 24,
    height: 24,
    position: 'relative',
    overflow: 'visible'
  },
  clearAllIcon: {
    width: '1em',
    height: '1em',
    position: 'absolute',
    top: 0,
    left: 10,
    color: 'rgb(98, 98, 98)'
  },
  deleteIcon: {
    width: '1em',
    height: '1em',
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'rgb(98, 98, 98)'
  }
}

@withStyles(styles)
class DeleteAllIcon extends React.Component {
  render () {
    const { classes, className, ...passProps } = this.props
    return (
      <span {...passProps} className={classNames(classes.wrapper, className)}>
        <ClearAllIcon className={classes.clearAllIcon} />
        <DeleteIcon className={classes.deleteIcon} />
      </span>
    )
  }
}

export default DeleteAllIcon
