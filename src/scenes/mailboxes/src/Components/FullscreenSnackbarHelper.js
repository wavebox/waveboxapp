import React from 'react'
import { settingsStore } from 'stores/settings'
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

  state = {
    accelerator: settingsStore.getState().accelerators.toggleFullscreen
  }

  settingsUpdated = (settingsState) => {
    this.setState({
      accelerator: settingsState.accelerators.toggleFullscreen
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { accelerator } = this.state
    return (
      <SharedFullscreenSnackbarHelper accelerator={accelerator} />
    )
  }
}
