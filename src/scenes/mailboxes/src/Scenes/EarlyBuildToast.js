import React from 'react'
import { Snackbar, Button } from '@material-ui/core'
import pkg from 'package.json'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  buildId: {
    color: lightBlue[200]
  }
}

@withStyles(styles)
class EarlyBuildToast extends React.Component {
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
  * Handles the user requesting to close the popup
  */
  handleRequestClose = () => {
    this.setState({ open: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    if (!pkg.earlyBuildId) { return false }
    const { classes } = this.props
    const { open } = this.state

    return (
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={(
          <div>
            <div>Thanks for testing this early build of Wavebox</div>
            <div>
              <span>{`You are currently using version `}</span>
              <span className={classes.buildId}>{`${pkg.version}:${pkg.earlyBuildId}`}</span>
            </div>
          </div>
        )}
        action={(
          <Button color='secondary' size='small' onClick={this.handleRequestClose}>
            Dismiss
          </Button>
        )}
        autoHideDuration={null} />
    )
  }
}

export default EarlyBuildToast
