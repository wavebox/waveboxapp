import React from 'react'
import { Paper, LinearProgress } from 'material-ui'

const styles = {
  container: {
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
    width: 400,
    marginBottom: 20,
    marginTop: 10
  }
}

export default class AuthenticationInstruction extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, ...passProps } = this.props

    return (
      <div {...passProps} style={{...styles.container, ...style}}>
        <h2 style={styles.title}>When prompted, use the popup authentication window to sign in to your account...</h2>
        <LinearProgress mode='indeterminate' style={styles.progress} />
        <Paper style={styles.window}>
          {process.platform === 'darwin' ? (
            <div style={styles.windowToolbar}>
              <div style={{...styles.windowToolbarButton, ...styles.windowToolbarButtonGreen}} />
              <div style={{...styles.windowToolbarButton, ...styles.windowToolbarButtonYellow}} />
              <div style={{...styles.windowToolbarButton, ...styles.windowToolbarButtonRed}} />
            </div>
          ) : (
            <div style={styles.windowToolbar}>
              <div style={{...styles.windowToolbarButton, ...styles.windowToolbarButtonRed}} />
              <div style={{...styles.windowToolbarButton, ...styles.windowToolbarButtonYellow}} />
              <div style={{...styles.windowToolbarButton, ...styles.windowToolbarButtonGreen}} />
            </div>
          )}
          <div style={styles.textBox} />
          <div style={styles.textBox} />
        </Paper>
      </div>
    )
  }
}
