import PropTypes from 'prop-types'
import React from 'react'
import { Paper } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const TARGET_URL_HEIGHT = 16
const styles = {
  container: {
    position: 'absolute',
    bottom: -TARGET_URL_HEIGHT - 5,
    height: TARGET_URL_HEIGHT,
    maxWidth: '50%',
    right: 0,
    backgroundColor: 'white',
    zIndex: 9,
    overflow: 'hidden',
    textAlign: 'right',
    fontSize: '11px',
    lineHeight: `${TARGET_URL_HEIGHT}px`,
    paddingLeft: 3,
    paddingRight: 3,
    transitionDuration: '150ms !important',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',

    '&.active': {
      bottom: 0
    }
  }
}

@withStyles(styles)
class BrowserViewTargetUrl extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { url, classes, className, ...passProps } = this.props

    return (
      <Paper {...passProps} className={classNames(classes.container, url ? 'active' : undefined, className)}>
        {url}
      </Paper>
    )
  }
}

export default BrowserViewTargetUrl
