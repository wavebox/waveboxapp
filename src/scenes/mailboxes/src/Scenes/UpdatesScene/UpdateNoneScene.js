import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core'
import UpdateModalTitle from './UpdateModalTitle'
import pkg from 'package.json'
import { withStyles } from '@material-ui/core/styles'
import DoneIcon from '@material-ui/icons/Done'

const styles = {
  dialogContent: {
    width: 600
  },
  versionInfo: {
    fontSize: '85%'
  }
}

@withStyles(styles)
class UpdateNoneScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes: {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual'])
      })
    })
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { open } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}>
        <UpdateModalTitle IconClass={DoneIcon} />
        <DialogContent className={classes.dialogContent}>
          <p>Your version of Wavebox is up to date</p>
          <p className={classes.versionInfo}>You're currently using Wavebox version <strong>{pkg.version}</strong></p>
        </DialogContent>
        <DialogActions>
          <Button variant='raised' color='primary' onClick={this.handleClose}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default UpdateNoneScene
