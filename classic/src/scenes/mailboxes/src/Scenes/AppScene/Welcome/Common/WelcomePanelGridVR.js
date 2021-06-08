import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import shallowCompare from 'react-addons-shallow-compare'

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  rule: {
    position: 'absolute',
    top: 24,
    left: 'calc(50% - 2px)',
    width: 2,
    bottom: 24,
    zIndex: 0
  },
  text: {
    fontWeight: 'bold',
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 1,
    fontSize: '22px',
    '@media (max-width: 930px)': {
      display: 'none'
    }
  }
}

@withStyles(styles)
class WelcomePanelGridVR extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    backgroundColor: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  }

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
      color,
      backgroundColor,
      ...passProps
    } = this.props

    return (
      <div className={classNames(className, classes.root)} {...passProps}>
        <div className={classes.rule} style={{ backgroundColor: color }} />
        {children ? (
          <div className={classes.text} style={{ backgroundColor: backgroundColor, color: color }}>
            {children}
          </div>
        ) : undefined}
      </div>
    )
  }
}

export default WelcomePanelGridVR
