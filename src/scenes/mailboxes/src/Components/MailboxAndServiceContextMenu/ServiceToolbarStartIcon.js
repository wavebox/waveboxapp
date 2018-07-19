import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import FAIcon from 'wbfa/FAIcon'

const styles = {
  wrapper: {
    width: 24,
    height: 24,
    fontSize: 24,
    position: 'relative',
    overflow: 'visible'
  },
  accIcon1: {
    width: '1em',
    height: '1em',
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 5
  },
  accIcon2: {
    width: '1em',
    height: '1em',
    position: 'absolute',
    top: 5,
    left: 11,
    fontSize: 5
  },
  squareIcon: {
    width: '1em',
    height: '1em',
    position: 'absolute',
    top: 0,
    left: 2,
    fontSize: 24
  }
}

@withStyles(styles)
class ServiceToolbarStartIcon extends React.Component {
  render () {
    const { classes, className, ...passProps } = this.props
    return (
      <span {...passProps} className={classNames(classes.wrapper, className)}>
        <FAIcon icon='fasCircle' className={classes.accIcon1} />
        <FAIcon icon='fasCircle' className={classes.accIcon2} />
        <FAIcon icon='farSquare' className={classes.squareIcon} />
      </span>
    )
  }
}

export default ServiceToolbarStartIcon
