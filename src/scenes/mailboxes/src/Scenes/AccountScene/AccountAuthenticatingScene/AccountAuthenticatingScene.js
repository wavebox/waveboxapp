import React from 'react'
import PropTypes from 'prop-types'
import { RouterDialog } from 'wbui/RouterDialog'
import AccountAuthenticatingSceneContent from './AccountAuthenticatingSceneContent'

class AccountAuthenticatingScene extends React.Component {
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
        <AccountAuthenticatingSceneContent />
      </RouterDialog>
    )
  }
}

export default AccountAuthenticatingScene
