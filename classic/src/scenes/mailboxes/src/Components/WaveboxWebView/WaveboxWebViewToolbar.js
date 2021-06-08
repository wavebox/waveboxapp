import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Paper, Toolbar, IconButton, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import Spinner from 'wbui/Activity/Spinner'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import CloseIcon from '@material-ui/icons/Close'
import RefreshIcon from '@material-ui/icons/Refresh'
import lightBlue from '@material-ui/core/colors/lightBlue'
import grey from '@material-ui/core/colors/grey'
import classNames from 'classnames'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 1 // produces dropshadow above webview
  },
  toolbar: {
    height: 40,
    minHeight: 40,
    backgroundColor: grey[200]
  },
  toolbarLoadingIconContainer: {
    width: 40,
    minWidth: 40,
    minHeight: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  toolbarTitle: {
    height: 40,
    lineHeight: '40px',
    width: '100%',
    overflow: 'hidden',
    fontSize: '14px',
    userSelect: 'initial',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: 'rgba(0, 0, 0, 0.4)'
  },
  toolbarButton: {
    color: 'rgba(0, 0, 0, 0.87)'
  }
}

@withStyles(styles)
class WaveboxWebViewToolbar extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    handleGoBack: PropTypes.func.isRequired,
    handleGoForward: PropTypes.func.isRequired,
    handleStop: PropTypes.func.isRequired,
    handleReload: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    pageTitle: PropTypes.string,
    canGoBack: PropTypes.bool.isRequired,
    canGoForward: PropTypes.bool.isRequired
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
      handleGoBack,
      handleGoForward,
      handleStop,
      handleReload,
      isLoading,
      pageTitle,
      canGoBack,
      canGoForward,
      ...passProps
    } = this.props

    return (
      <Paper className={classNames(classes.root, className)} {...passProps}>
        <Toolbar disableGutters className={classes.toolbar}>
          <IconButton disabled={!canGoBack} onClick={handleGoBack} className={classes.toolbarButton}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton disabled={!canGoForward} onClick={handleGoForward} className={classes.toolbarButton}>
            <ArrowForwardIcon />
          </IconButton>
          <IconButton onClick={isLoading ? handleStop : handleReload} className={classes.toolbarButton}>
            {isLoading ? (<CloseIcon />) : (<RefreshIcon />)}
          </IconButton>
          <div className={classes.toolbarLoadingIconContainer}>
            {isLoading ? (
              <Spinner size={15} color={lightBlue[600]} />
            ) : undefined}
          </div>
          <Typography className={classes.toolbarTitle}>
            {pageTitle}
          </Typography>
        </Toolbar>
      </Paper>
    )
  }
}

export default WaveboxWebViewToolbar
