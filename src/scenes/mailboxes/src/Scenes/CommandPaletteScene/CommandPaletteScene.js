import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import Zoom from '@material-ui/core/Zoom'
import { RouterDialog } from 'Components/RouterDialog'
import CommandPaletteSceneContent from './CommandPaletteSceneContent'

const TRANSITION_DURATION = 50

class CommandPaletteScene extends React.Component {
  /* **************************************************************************/
  // PropTypes
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

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
    const { routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        transitionDuration={TRANSITION_DURATION}
        TransitionComponent={Zoom}
        onClose={this.handleClose}>
        <CommandPaletteSceneContent />
      </RouterDialog>
    )
  }
}

export default CommandPaletteScene
