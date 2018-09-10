import React from 'react'
import { Paper } from '@material-ui/core'
import Spinner from './Activity/Spinner'
import { ipcRenderer } from 'electron'
import { WB_FOCUS_AUTH_WINDOW } from 'shared/ipcEvents'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  window: {
    width: 400,
    height: 300,
    overflow: 'hidden',
    backgroundColor: 'rgb(234, 234, 234)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  windowToolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 25,
    paddingLeft: 4,
    paddingRight: 4,
    lineHeight: '25px',
    textAlign: process.platform === 'darwin' ? 'left' : 'right',
    backgroundColor: 'rgb(211,211,211)'
  },
  windowToolbarButton: {
    width: 12,
    height: 12,
    marginTop: -4,
    display: 'inline-block',
    marginLeft: 4,
    marginRight: 4,
    borderRadius: '50%',
    verticalAlign: 'middle'
  },
  windowToolbarButtonGreen: {
    backgroundColor: 'rgb(255, 97, 87)'
  },
  windowToolbarButtonYellow: {
    backgroundColor: 'rgb(255, 191, 47)'
  },
  windowToolbarButtonRed: {
    backgroundColor: 'rgb(100, 207, 69)'
  },
  textBox: {
    backgroundColor: 'rgb(244, 244, 244)',
    border: '1px solid rgb(224, 224, 224)',
    borderRadius: 3,
    height: 40,
    width: 300,
    marginTop: 8,
    marginBottom: 8
  },
  title: {
    fontWeight: 300,
    fontSize: '20px'
  },
  progress: {
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center'
  }
}

@withStyles(styles)
class AuthenticationInstruction extends React.Component {
  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClick = () => {
    ipcRenderer.send(WB_FOCUS_AUTH_WINDOW)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, classes, ...passProps } = this.props

    return (
      <div {...passProps} className={classNames(classes.container, className)} onClick={this.handleClick}>
        <h2 className={classes.title}>When prompted, use the popup authentication window to sign in to your account...</h2>
        <div className={classes.progress}>
          <Spinner size={30} color={lightBlue[600]} speed={0.5} />
        </div>
        <Paper className={classes.window}>
          {process.platform === 'darwin' ? (
            <div className={classes.windowToolbar}>
              <div className={classNames(classes.windowToolbarButton, classes.windowToolbarButtonGreen)} />
              <div className={classNames(classes.windowToolbarButton, classes.windowToolbarButtonYellow)} />
              <div className={classNames(classes.windowToolbarButton, classes.windowToolbarButtonRed)} />
            </div>
          ) : (
            <div className={classes.windowToolbar}>
              <div className={classNames(classes.windowToolbarButton, classes.windowToolbarButtonRed)} />
              <div className={classNames(classes.windowToolbarButton, classes.windowToolbarButtonYellow)} />
              <div className={classNames(classes.windowToolbarButton, classes.windowToolbarButtonGreen)} />
            </div>
          )}
          <div className={classes.textBox} />
          <div className={classes.textBox} />
        </Paper>
      </div>
    )
  }
}

export default AuthenticationInstruction
