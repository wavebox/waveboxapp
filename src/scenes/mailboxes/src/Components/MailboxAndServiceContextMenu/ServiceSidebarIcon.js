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
  accIcon: {
    width: '1em',
    height: '1em',
    position: 'absolute',
    top: 4,
    left: 5,
    fontSize: 16
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
class ServiceSidebarIcon extends React.Component {
  render () {
    const { classes, className, ...passProps } = this.props
    return (
      <span {...passProps} className={classNames(classes.wrapper, className)}>
        <FAIcon icon='fasEllipsisV' className={classes.accIcon} />
        <FAIcon icon='farSquare' className={classes.squareIcon} />
      </span>
    )
  }
}

export default ServiceSidebarIcon
