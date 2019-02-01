import React from 'react'
import { emblinkActions } from 'stores/emblink'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import ComposePickerSceneContent from './ComposePickerSceneContent'
import { RouterDialog } from 'wbui/RouterDialog'

class ComposePickerScene extends React.Component {
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
  * Dismisses the compose actions
  * @param evt: the event that fired
  */
  handleCancel = (evt) => {
    window.location.hash = '/'
    emblinkActions.clearCompose()
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
        onClose={this.handleCancel}>
        <ComposePickerSceneContent />
      </RouterDialog>
    )
  }
}

export default ComposePickerScene
