import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { updaterActions } from 'stores/updater'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import UpdateErrorSceneContent from './UpdateErrorSceneContent'

class UpdateErrorScene extends React.Component {
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
  * Checks for updates again later
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
        <RouterDialogStateProvider routeName={routeName} Component={UpdateErrorSceneContent} />
      </RouterDialog>
    )
  }
}

export default UpdateErrorScene
