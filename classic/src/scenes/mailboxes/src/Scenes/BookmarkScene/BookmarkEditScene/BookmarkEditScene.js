import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import BookmarkEditSceneContent from './BookmarkEditSceneContent'

class BookmarkEditScene extends React.Component {
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
        onClose={this.handleClose}>
        <RouterDialogStateProvider routeName={routeName} Component={BookmarkEditSceneContent} />
      </RouterDialog>
    )
  }
}

export default BookmarkEditScene
