import React from 'react'
import PropTypes from 'prop-types'
import ProfileRestoreRestartingSceneContent from './ProfileRestoreRestartingSceneContent'
import { RouterDialog } from 'wbui/RouterDialog'

class ProfileRestoreRestartingScene extends React.Component {
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
        <ProfileRestoreRestartingSceneContent />
      </RouterDialog>
    )
  }
}

export default ProfileRestoreRestartingScene
