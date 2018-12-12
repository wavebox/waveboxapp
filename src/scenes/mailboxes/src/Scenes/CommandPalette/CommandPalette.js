import React from 'react'
import { Button, Dialog, DialogContent, DialogActions } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  }
}

@withStyles(styles)
class CommandPalette extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {

  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    //const { classes } = this.props
    const classes = {}
    const {
      open
    } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          Content goes here
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant='contained' color='primary' onClick={this.handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default CommandPalette
