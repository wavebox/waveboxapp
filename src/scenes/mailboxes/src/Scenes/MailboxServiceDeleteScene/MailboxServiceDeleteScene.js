import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RouterDialog, RouterDialogMatchProvider } from 'Components/RouterDialog'
import PropTypes from 'prop-types'
import MailboxServiceDeleteSceneContent from './MailboxServiceDeleteSceneContent'

class MailboxServiceDeleteScene extends React.Component {
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
    const { routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        onClose={this.handleClose}>
        <RouterDialogMatchProvider routeName={routeName} Component={MailboxServiceDeleteSceneContent} />
      </RouterDialog>
    )
  }
}

export default MailboxServiceDeleteScene
