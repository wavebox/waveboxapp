import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper } from 'material-ui'
import { settingsActions } from 'stores/settings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class AdvancedSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired,
    extension: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      showRestart,
      app,
      extension,
      style,
      ...passProps
    } = this.props

    return (
      <Paper zDepth={1} style={{...styles.paper, ...style}} {...passProps}>
        <Toggle
          toggled={app.ignoreGPUBlacklist}
          label='Ignore GPU Blacklist (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.ignoreGPUBlacklist(toggled)
          }} />
        <Toggle
          toggled={!app.disableHardwareAcceleration}
          label='Hardware acceleration (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.disableHardwareAcceleration(!toggled)
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
          toggled={!app.disableSmoothScrolling}
          label='Smooth Scrolling (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.disableSmoothScrolling(!toggled)
          }} />
        <Toggle
          toggled={app.enableGeolocationApi}
          label='Geolocation API'
          labelPosition='right'
          onToggle={(evt, toggled) => { settingsActions.setEnableGeolocationApi(toggled) }} />
        <Toggle
          toggled={extension.enableChromeExperimental}
          label='Experimental chrome extension support (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.setExtensionEnableChromeExperimental(toggled)
          }} />
      </Paper>
    )
  }
}
