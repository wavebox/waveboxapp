import React from 'react'
import { settingsStore, settingsActions } from 'stores/settings'
import SidelistControlWizard from './SidelistControlWizard'
import SidelistControlSupport from './SidelistControlSupport'
import SidelistControlAddMailbox from './SidelistControlAddMailbox'
import SidelistControlSettings from './SidelistControlSettings'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistControlWhatsNew from './SidelistControlWhatsNew'
import SidelistControlExpander from './SidelistControlExpander'
import classnames from 'classnames'

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
      showSupport: settingsState.ui.showSidebarSupport,
      collapsed: settingsState.ui.sidebarControlsCollapsed
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      showWizard: !settingsState.app.hasSeenAppWizard,
      showSupport: settingsState.ui.showSidebarSupport,
      collapsed: settingsState.ui.sidebarControlsCollapsed
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, ...passProps } = this.props
    const { showWizard, showSupport, collapsed } = this.state

    return (
      <div {...passProps} className={classnames('WB-SidelistControls', className)}>
        <SidelistControlExpander
          expanded={!collapsed}
          onClick={() => { settingsActions.sub.ui.setSidebarControlsCollapsed(!collapsed) }} />
        <div style={{ height: collapsed ? '0' : 'initial' }}>
          <SidelistControlWhatsNew />
          {showWizard ? (<SidelistControlWizard />) : undefined}
          {showSupport ? (<SidelistControlSupport />) : undefined}
          <SidelistControlAddMailbox />
          <SidelistControlSettings />
        </div>
      </div>
    )
  }
}
