import React from 'react'
import { Snackbar } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import pkg from 'package.json'

const styles = {
  body: {
    height: 'auto',
    lineHeight: '28px',
    padding: 16,
    whiteSpace: 'pre-line'
  },
  buildId: {
    color: Colors.lightBlue200
  }
}

export default class EarlyBuildToast extends React.Component {
  /* **************************************************************************/
  // State
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the user touching the dismiss button
  */
  handleActionTouchTap = () => {
    this.setState({ open: false })
  }

  /**
  * Handles the user requesting to close the popup
  */
  handleRequestClose = () => {
    this.setState({ open: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  renderMessage () {
    if (!this.messageElement) {
      this.messageElement = (
        <div>
          <div>Thanks for testing this early build of Wavebox</div>
          <div>
            <span>{`You are currently using version `}</span>
            <span style={styles.buildId}>{`${pkg.version}:${pkg.earlyBuildId}`}</span>
          </div>
        </div>
      )
    }
    return this.messageElement
  }

  render () {
    if (!pkg.earlyBuildId) { return false }
    const { open } = this.state

    return (
      <Snackbar
        open={open}
        message={this.renderMessage()}
        action='Dismiss'
        bodyStyle={styles.body}
        autoHideDuration={-1}
        onRequestClose={this.handleRequestClose}
        onActionTouchTap={this.handleActionTouchTap} />
    )
  }
}
