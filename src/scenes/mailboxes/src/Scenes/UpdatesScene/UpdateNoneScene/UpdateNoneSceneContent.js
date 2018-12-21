import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogContent, DialogActions, Button } from '@material-ui/core'
import UpdateModalTitle from '../Common/UpdateModalTitle'
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
class UpdateNoneSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual']).isRequired
      }).isRequired
    }).isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props

    return (
      <React.Fragment>
        <UpdateModalTitle IconClass={DoneIcon} />
        <DialogContent className={classes.dialogContent}>
          <p>Your version of Wavebox is up to date</p>
          <p className={classes.versionInfo}>You're currently using Wavebox version <strong>{pkg.version}</strong></p>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={this.handleClose}>
            Done
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default UpdateNoneSceneContent
