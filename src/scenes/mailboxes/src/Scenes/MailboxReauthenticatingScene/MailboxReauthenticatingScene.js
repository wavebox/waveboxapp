import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AuthenticationInstruction from 'wbui/AuthenticationInstruction'
import { Dialog, DialogContent } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative',
    backgroundColor: 'rgb(242, 242, 242)'
  },
  instruction: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
}

@withStyles(styles)
class MailboxReauthenticatingScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {classes} = this.props

    return (
      <Dialog
        disableEnforceFocus
        open
        disableBackdropClick
        disableEscapeKeyDown
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          <AuthenticationInstruction className={classes.instruction} />
        </DialogContent>
      </Dialog>
    )
  }
}

export default MailboxReauthenticatingScene
