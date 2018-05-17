import React from 'react'
import { Dialog, DialogContent } from 'material-ui'
import Spinner from 'wbui/Activity/Spinner'
import { withStyles } from 'material-ui/styles'
import lightBlue from 'material-ui/colors/lightBlue'

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
export default class AccountAuthenticatingScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props
    return (
      <Dialog open disableBackdropClick disableEscapeKeyDown>
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
