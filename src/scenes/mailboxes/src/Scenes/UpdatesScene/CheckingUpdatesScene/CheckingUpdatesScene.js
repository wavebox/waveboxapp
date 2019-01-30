import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import CheckingUpdatesSceneContent from './CheckingUpdatesSceneContent'

class CheckingUpdatesScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleMinimize = () => {
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
        onClose={this.handleMinimize}>
        <RouterDialogStateProvider routeName={routeName} Component={CheckingUpdatesSceneContent} />
      </RouterDialog>
    )
  }
}

export default CheckingUpdatesScene
