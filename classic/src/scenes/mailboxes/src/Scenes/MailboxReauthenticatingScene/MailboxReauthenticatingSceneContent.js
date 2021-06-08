import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import AuthenticationInstruction from 'wbui/AuthenticationInstruction'
import { DialogContent } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
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
class MailboxReauthenticatingSceneContent extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props

    return (
      <DialogContent className={classes.dialogContent}>
        <AuthenticationInstruction
          onRequestMinimize={() => { window.location.hash = '/' }}
          className={classes.instruction} />
      </DialogContent>
    )
  }
}

export default MailboxReauthenticatingSceneContent
