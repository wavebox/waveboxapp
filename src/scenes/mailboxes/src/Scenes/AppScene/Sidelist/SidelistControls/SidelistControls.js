import React from 'react'
import { settingsStore } from 'stores/settings'
import SidelistControlWhatsNew from './SidelistControlWhatsNew'
import SidelistControlWizard from './SidelistControlWizard'
import SidelistControlSupport from './SidelistControlSupport'
import SidelistControlAddMailbox from './SidelistControlAddMailbox'
import SidelistControlSettings from './SidelistControlSettings'

export default class SidelistControls extends React.Component {
  /* **************************************************************************/
  // Lifecycle
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
      showWizard: !settingsState.app.hasSeenAppWizard,
      showNewsFeed: false, // settingsState.ui.showSidebarNewsfeed,
      showSupport: settingsState.ui.showSidebarSupport
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      showWizard: !settingsState.app.hasSeenAppWizard,
      showNewsFeed: false, // settingsState.ui.showSidebarNewsfeed,
      showSupport: settingsState.ui.showSidebarSupport
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { ...passProps } = this.props
    const { showWizard, showNewsFeed, showSupport } = this.state

    return (
      <div {...passProps}>
        {showNewsFeed ? (<SidelistControlWhatsNew />) : undefined}
        {showWizard ? (<SidelistControlWizard />) : undefined}
        {showSupport ? (<SidelistControlSupport />) : undefined}
        <SidelistControlAddMailbox />
        <SidelistControlSettings />
      </div>
    )
  }
}
