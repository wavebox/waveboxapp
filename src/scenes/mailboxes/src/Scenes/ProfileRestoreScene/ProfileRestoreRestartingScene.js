import React from 'react'
import { Dialog, DialogContent } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import FARSyncAltIcon from 'wbfa/FARSyncAlt'

const styles = {
  dialogContent: {
    width: 240,
    textAlign: 'center'
  },
  text: {
    marginTop: 30
  }
}

@withStyles(styles)
class ProfileRestoreRestartingScene extends React.Component {
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
          <FARSyncAltIcon className={classes.buttonIcon} size='6x' spin color={lightBlue[600]} />
          <div className={classes.text}>
            Preparing to restart...
          </div>
        </DialogContent>
      </Dialog>
    )
  }
}

export default ProfileRestoreRestartingScene
