import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper } from 'material-ui'
import { settingsStore, settingsActions } from 'stores/settings'
import styles from './SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class AdvancedSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState (settingsState = settingsStore.getState()) {
    return {
      app: settingsState.app
    }
  }

  state = (() => {
    return this.generateState()
  })()

  settingsChanged = (store) => {
    this.setState(this.generateState(store))
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { app } = this.state
    const { showRestart, ...passProps } = this.props

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <Toggle
            toggled={app.ignoreGPUBlacklist}
            label='Ignore GPU Blacklist (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.ignoreGPUBlacklist(toggled)
            }} />
          <Toggle
            toggled={app.enableUseZoomForDSF}
            label='Use Zoom For DSF (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.enableUseZoomForDSF(toggled)
            }} />
          <Toggle
            toggled={app.disableSmoothScrolling}
            label='Disable Smooth Scrolling (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.disableSmoothScrolling(toggled)
            }} />
          <Toggle
            toggled={app.checkForUpdates}
            label='Check for updates'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.checkForUpdates(toggled)
            }} />
        </Paper>
      </div>
    )
  }
}
