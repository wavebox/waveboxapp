import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import electron from 'electron'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import WidgetsIcon from '@material-ui/icons/Widgets'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import FontDownloadIcon from '@material-ui/icons/FontDownload'

const styles = {
  dialog: {
    maxWidth: 600,
    width: 600,
    minWidth: 600
  },
  dialogContent: {
    width: 600
  },
  titleIcon: {
    verticalAlign: 'top',
    marginRight: 10
  },
  instructionImage: {
    width: '100%',
    height: 250,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  linkText: {
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  buttonIcon: {
    marginRight: 8
  },
  button: {
    marginLeft: 8,
    marginRight: 8
  },
  actionSpacer: {
    maxWidth: '100%',
    width: 'auto',
    flexGrow: 1
  }
}

@withStyles(styles)
class LinuxSetupScene extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true,
    hasVisitedFontLink: false
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleFontsClick = () => {
    this.setState({ hasVisitedFontLink: true })
    electron.shell.openExternal('https://wavebox.io/kb/installing-linux-fonts')
  }

  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  handleDone = () => {
    settingsActions.sub.app.setHasSeenLinuxSetupMessage(true)
    this.handleClose()
  }

  handleRemindNextTime = () => {
    this.handleClose()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    if (process.platform !== 'linux') { return false }
    const { classes } = this.props
    const { open, hasVisitedFontLink } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleRemindNextTime}
        classes={{ paper: classes.dialog }}>
        <DialogTitle>
          <WidgetsIcon className={classes.titleIcon} />
          Finish your Wavebox install
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.instructionImage} style={{ backgroundImage: `url("${Resolver.image('linux_font_setup.png')}")` }} />
          <p>
            <span>
              To get the best out of Wavebox, we recommend installing some additional fonts
              on your system. There's some information available in our Knowledge base on how
              to do this
            </span>
            &nbsp;
            <span onClick={this.handleFontsClick} className={classes.linkText}>
              wavebox.io/kb/installing-linux-fonts
            </span>
          </p>
        </DialogContent>
        <DialogActions>
          <Button className={classes.button} onClick={this.handleDone}>
            Don't remind me again
          </Button>
          <Button className={classes.button} onClick={this.handleRemindNextTime}>
            Remind me later
          </Button>
          <div className={classes.actionSpacer} />
          {hasVisitedFontLink ? (
            <Button variant='raised' color='primary' className={classes.button} onClick={this.handleDone}>
              <CheckCircleIcon className={classes.buttonIcon} />
              Done
            </Button>
          ) : (
            <Button variant='raised' color='primary' className={classes.button} onClick={this.handleFontsClick}>
              <FontDownloadIcon className={classes.buttonIcon} />
              Find out how
            </Button>
          )}
        </DialogActions>
      </Dialog>
    )
  }
}

export default LinuxSetupScene
