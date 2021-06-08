import React from 'react'
import { DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import Resolver from 'Runtime/Resolver'
import { withStyles } from '@material-ui/core/styles'
import WidgetsIcon from '@material-ui/icons/Widgets'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import FontDownloadIcon from '@material-ui/icons/FontDownload'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
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
class LinuxSetupSceneContent extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    hasVisitedFontLink: false
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleFontsClick = () => {
    this.setState({ hasVisitedFontLink: true })
    WBRPCRenderer.wavebox.openExternal('https://wavebox.io/kb/installing-linux-fonts')
  }

  handleClose = () => {
    window.location.hash = '/'
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
    const { classes } = this.props
    const { hasVisitedFontLink } = this.state

    return (
      <React.Fragment>
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
            <Button variant='contained' color='primary' className={classes.button} onClick={this.handleDone}>
              <CheckCircleIcon className={classes.buttonIcon} />
              Done
            </Button>
          ) : (
            <Button variant='contained' color='primary' className={classes.button} onClick={this.handleFontsClick}>
              <FontDownloadIcon className={classes.buttonIcon} />
              Find out how
            </Button>
          )}
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default LinuxSetupSceneContent
