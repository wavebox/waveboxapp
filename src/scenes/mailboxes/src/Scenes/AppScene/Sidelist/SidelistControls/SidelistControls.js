import React from 'react'
import { settingsStore } from 'stores/settings'
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
      expanded: true
    }
  })()

  settingsUpdated = (settingsState) => {
    this.setState({
      showWizard: !settingsState.app.hasSeenAppWizard,
      showSupport: settingsState.ui.showSidebarSupport
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
    const { showWizard, showSupport } = this.state

    return (
      <div {...passProps} className={classnames('WB-SidelistControls', className)}>
        <SidelistControlExpander expanded={this.state.expanded}
          onClick={() => { this.setState({ expanded: !this.state.expanded }) }} />
        <div style={{
          'height': this.state.expanded ? 'initial' : '0'
        }}>
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
