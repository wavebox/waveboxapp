import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, FontIcon, RaisedButton } from 'material-ui'
import { settingsActions } from 'stores/settings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import CustomStylesEditingDialog from './CustomStylesEditingDialog'
import DistributionConfig from 'Runtime/DistributionConfig'

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
            settingsActions.sub.app.ignoreGPUBlacklist(toggled)
          }} />
        <Toggle
          toggled={!app.disableHardwareAcceleration}
          label='Hardware acceleration (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.disableHardwareAcceleration(!toggled)
          }} />
        <Toggle
          toggled={app.enableUseZoomForDSF}
          label='Use Zoom For DSF (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.enableUseZoomForDSF(toggled)
          }} />
        <Toggle
          toggled={!app.disableSmoothScrolling}
          label='Smooth Scrolling (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.disableSmoothScrolling(!toggled)
          }} />
        <Toggle
          toggled={app.enableGeolocationApi}
          label='Geolocation API'
          labelPosition='right'
          onToggle={(evt, toggled) => { settingsActions.sub.app.setEnableGeolocationApi(toggled) }} />
        {DistributionConfig.isSnapInstall ? undefined : (
          <Toggle
            toggled={app.enableAutofillService}
            label='Autofill passwords on right click'
            labelPosition='right'
            onToggle={(evt, toggled) => { settingsActions.sub.app.setEnableAutofillServie(toggled) }} />
        )}
        <Toggle
          toggled={extension.enableChromeExperimental}
          label='Experimental chrome extension support (Requires Restart)'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.sub.extension.setEnableChromeExperimental(toggled)
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
              settingsActions.sub.ui.setCustomMainCSS(css)
            }} />
        </div>
      </Paper>
    )
  }
}
