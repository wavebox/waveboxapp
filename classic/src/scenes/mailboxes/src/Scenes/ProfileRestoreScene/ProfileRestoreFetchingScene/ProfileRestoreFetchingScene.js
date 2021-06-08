import React from 'react'
import PropTypes from 'prop-types'
import ProfileRestoreFetchingSceneContent from './ProfileRestoreFetchingSceneContent'
import { RouterDialog } from 'wbui/RouterDialog'

class ProfileRestoreFetchingScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClose = () => {
    // We allow the user to close this in case the request fails
    window.location.hash = '/'
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
        onClose={this.handleClose}>
        <ProfileRestoreFetchingSceneContent />
      </RouterDialog>
    )
  }
}

export default ProfileRestoreFetchingScene
