import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import ProfileRestoreSceneContent from './ProfileRestoreSceneContent'
import { RouterDialog } from 'wbui/RouterDialog'

class ProfileRestoreScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

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
        onClose={this.handleClose}>
        <ProfileRestoreSceneContent />
      </RouterDialog>
    )
  }
}

export default ProfileRestoreScene
