import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { updaterActions } from 'stores/updater'
import UpdateAvailableSceneContent from './UpdateAvailableSceneContent'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'

class UpdateAvailableScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // UI Events: Manual
  /* **************************************************************************/

  /**
  * Reprompts the user later on
  */
  handleCheckLater = () => {
    window.location.hash = '/'
    updaterActions.scheduleNextUpdateCheck()
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
        onClose={this.handleCheckLater}>
        <RouterDialogStateProvider
          routeName={routeName}
          location
          match
          Component={UpdateAvailableSceneContent} />
      </RouterDialog>
    )
  }
}

export default UpdateAvailableScene
