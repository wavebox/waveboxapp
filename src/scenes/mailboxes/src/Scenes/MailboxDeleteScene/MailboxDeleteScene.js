import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import MailboxDeleteSceneContent from './MailboxDeleteSceneContent'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'

class MailboxDeleteScene extends React.Component {
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
        <RouterDialogStateProvider routeName={routeName} Component={MailboxDeleteSceneContent} />
      </RouterDialog>
    )
  }
}

export default MailboxDeleteScene
