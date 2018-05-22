import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import CustomStylesEditingDialog from './CustomStylesEditingDialog'
import DistributionConfig from 'Runtime/DistributionConfig'
import { AppSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import { withStyles } from '@material-ui/core/styles'
import WarningIcon from '@material-ui/icons/Warning'
import CodeIcon from '@material-ui/icons/Code'
import SettingsListItemButton from 'wbui/SettingsListItemButton'
import TuneIcon from '@material-ui/icons/Tune'
import SettingsListTypography from 'wbui/SettingsListTypography'

const styles = {

}

@withStyles(styles)
class AdvancedSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired,
    language: PropTypes.object.isRequired,
    extension: PropTypes.object.isRequired,
    tray: PropTypes.object.isRequired,
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
      language,
      ui,
      tray,
      classes,
      ...passProps
    } = this.props
    const {
      customCSSEditorOpen
    } = this.state

    return (
      <SettingsListSection {...passProps} title='Advanced' icon={<TuneIcon />}>
        <SettingsListItemSwitch
          label='Ignore GPU Blacklist (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.ignoreGPUBlacklist(toggled)
          }}
          checked={app.ignoreGPUBlacklist} />
        <SettingsListItemSwitch
          label='Hardware acceleration (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.disableHardwareAcceleration(!toggled)
          }}
          checked={!app.disableHardwareAcceleration} />
        <SettingsListItemSwitch
          label='Isolate Account Processes (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.setIsolateMailboxProcesses(toggled)
          }}
          checked={app.isolateMailboxProcesses} />
        {AppSettings.SUPPORTS_MIXED_SANDBOX_MODE ? (
          <SettingsListItemSwitch
            label='Enable Sanboxing (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.app.setEnableMixedSandboxMode(toggled)
            }}
            checked={app.enableMixedSandboxMode} />
        ) : undefined}
        <SettingsListItemSwitch
          label='Use Zoom For DSF (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.enableUseZoomForDSF(toggled)
          }}
          checked={app.enableUseZoomForDSF} />
        <SettingsListItemSwitch
          label='Smooth Scrolling (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.disableSmoothScrolling(!toggled)
          }}
          checked={!app.disableSmoothScrolling} />
        <SettingsListItemSwitch
          label='Geolocation API'
          onChange={(evt, toggled) => { settingsActions.sub.app.setEnableGeolocationApi(toggled) }}
          checked={app.enableGeolocationApi} />
        {DistributionConfig.isSnapInstall ? undefined : (
          <SettingsListItemSwitch
            label='Autofill passwords on right click'
            onChange={(evt, toggled) => { settingsActions.sub.app.setEnableAutofillServie(toggled) }}
            checked={app.enableAutofillService} />
        )}
        <SettingsListItemSwitch
          label='In process spellchecking (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.language.setInProcessSpellchecking(toggled)
          }}
          checked={language.inProcessSpellchecking} />
        <SettingsListItemSwitch
          label='Window opening engine (Recommended)'
          secondary={app.enableWindowOpeningEngine === false ? (
            <SettingsListTypography type='warning' icon={<WarningIcon />}>
              All links will open in your default browser. You may experience
              broken links and blank windows with this setting
            </SettingsListTypography>
          ) : (
            <SettingsListTypography>
              All links will open in your default browser. You may experience
              broken links and blank windows with this setting
            </SettingsListTypography>
          )}
          onChange={(evt, toggled) => {
            settingsActions.sub.app.setEnableWindowOpeningEngine(toggled)
          }}
          checked={app.enableWindowOpeningEngine} />
        <SettingsListItemButton
          divider={false}
          label='Main Window Custom CSS'
          icon={<CodeIcon />}
          onClick={() => {
            this.setState({ customCSSEditorOpen: true })
          }} />
        <CustomStylesEditingDialog
          title='Main Window Custom CSS'
          open={customCSSEditorOpen}
          code={ui.customMainCSS}
          onCancel={() => this.setState({ customCSSEditorOpen: false })}
          onSave={(evt, css) => {
            this.setState({ customCSSEditorOpen: false })
            settingsActions.sub.ui.setCustomMainCSS(css)
          }} />
      </SettingsListSection>
    )
  }
}

export default AdvancedSettingsSection
