import React from 'react'
import PropTypes from 'prop-types'
import SpinnerSceneContent from './SpinnerSceneContent'
import { RouterDialog } from 'wbui/RouterDialog'

class SpinnerScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { routeName } = this.props
    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        disableBackdropClick
        disableEscapeKeyDown>
        <SpinnerSceneContent />
      </RouterDialog>
    )
  }
}

export default SpinnerScene
