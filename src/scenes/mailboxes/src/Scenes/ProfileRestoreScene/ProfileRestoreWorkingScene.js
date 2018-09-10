import React from 'react'
import { Dialog, DialogContent } from '@material-ui/core'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  dialogContent: {
    width: 180,
    textAlign: 'center'
  },
  text: {
    marginTop: 20
  }
}

@withStyles(styles)
class ProfileRestoreWorkingScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props
    return (
      <Dialog
        disableEnforceFocus
        open
        disableBackdropClick
        disableEscapeKeyDown>
        <DialogContent className={classes.dialogContent}>
          <Spinner size={50} color={lightBlue[600]} speed={0.75} />
          <div className={classes.text}>
            Just a moment...
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default ProfileRestoreWorkingScene
