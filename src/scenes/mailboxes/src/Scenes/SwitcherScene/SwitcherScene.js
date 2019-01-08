import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import Zoom from '@material-ui/core/Zoom'
import SwitcherSceneContent from './SwitcherSceneContent'
import { RouterDialog, RouterDialogStateProvider } from 'Components/RouterDialog'

const TRANSITION_DURATION = 50

const styles = {
  root: {
    maxWidth: '100%',
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    borderRadius: 10
  }
}

@withStyles(styles)
class SwitcherScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
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
    const { classes, routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        transitionDuration={TRANSITION_DURATION}
        TransitionComponent={Zoom}
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider routeName={routeName} Component={SwitcherSceneContent} />
      </RouterDialog>
    )
  }
}

export default SwitcherScene
