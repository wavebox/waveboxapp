import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, FontIcon, RaisedButton } from 'material-ui'
import { settingsActions } from 'stores/settings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import CustomStylesEditingDialog from './CustomStylesEditingDialog'

export default class AdvancedSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired,
    extension: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    customCSSEditorOpen: false
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
      ui,
      style,
      ...passProps
    } = this.props
    const {
      customCSSEditorOpen
    } = this.state

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
        <div style={{ marginTop: 8 }}>
          <RaisedButton
            style={styles.buttonInline}
            label='Main Window Custom CSS'
            icon={<FontIcon className='material-icons'>code</FontIcon>}
            onClick={() => this.setState({ customCSSEditorOpen: true })} />
          <CustomStylesEditingDialog
            title='Main Window Custom CSS'
            open={customCSSEditorOpen}
            code={ui.customMainCSS}
            onCancel={() => this.setState({ customCSSEditorOpen: false })}
            onSave={(evt, css) => {
              this.setState({ customCSSEditorOpen: false })
              settingsActions.setCustomMainCSS(css)
            }} />
        </div>
      </Paper>
    )
  }
}
