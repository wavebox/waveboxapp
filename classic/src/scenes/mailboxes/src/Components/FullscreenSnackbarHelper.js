import React from 'react'
import { settingsStore, settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import SharedFullscreenSnackbarHelper from 'wbui/FullscreenSnackbarHelper'

export default class FullscreenSnackbar extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      accelerator: settingsState.accelerators.toggleFullscreen,
      show: settingsState.ui.showFullscreenHelper
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      accelerator: settingsState.accelerators.toggleFullscreen,
      show: settingsState.ui.showFullscreenHelper
    })
  }

  /* **************************************************************************/
  // UI Actions
  /* **************************************************************************/

  handleStopShowing = () => {
    settingsActions.sub.ui.setShowFullscreenHelper(false)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { accelerator, show } = this.state
    if (!show) { return false }
    return (
      <SharedFullscreenSnackbarHelper
        onRequestStopShowing={this.handleStopShowing}
        accelerator={accelerator} />
    )
  }
}
