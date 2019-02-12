import PropTypes from 'prop-types'
import React from 'react'
import DictionaryInstallerSceneContent from './DictionaryInstallerSceneContent'
import { RouterDialog } from 'wbui/RouterDialog'

export default class DictionaryInstallerScene extends React.Component {
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
        <DictionaryInstallerSceneContent />
      </RouterDialog>
    )
  }
}
