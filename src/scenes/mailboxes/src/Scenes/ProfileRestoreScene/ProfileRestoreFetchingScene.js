import React from 'react'
import { Dialog, DialogContent } from '@material-ui/core'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  dialogContent: {
    width: 200,
    textAlign: 'center'
  },
  text: {
    marginTop: 20
  }
}

@withStyles(styles)
class ProfileRestoreWorkingScene extends React.Component {
  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClose = () => {
    // We allow the user to close this in case the request fails
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props
    return (
      <Dialog
        disableEnforceFocus
        open
        onClose={this.handleClose}>
        <DialogContent className={classes.dialogContent}>
          <Spinner size={50} color={lightBlue[600]} speed={0.75} />
          <div className={classes.text}>
            Fetching profiles...
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default ProfileRestoreWorkingScene
