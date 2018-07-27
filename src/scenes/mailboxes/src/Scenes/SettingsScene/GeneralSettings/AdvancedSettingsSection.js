import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
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
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'

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
    return (
      modelCompare(this.props.app, nextProps.app, [
        'ignoreGPUBlacklist',
        'disableHardwareAcceleration',
        'isolateMailboxProcesses',
        'enableMixedSandboxMode',
        'enableUseZoomForDSF',
        'disableSmoothScrolling',
        'enableAutofillService',
        'enableWindowOpeningEngine',
        'enableMouseNavigationDarwin'
      ]) ||
      modelCompare(this.props.language, nextProps.language, ['inProcessSpellchecking']) ||
      modelCompare(this.props.ui, nextProps.ui, ['customMainCSS']) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
  }

  render () {
    const {
      showRestart,
      app,
      language,
      ui,
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
            label='Enable Sandboxing (Requires Restart)'
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
        {process.platform === 'darwin' ? (
          <SettingsListItemSwitch
            label='Touchpad swipe Navigation (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.app.setEnableMouseNavigationDarwin(toggled)
            }}
            checked={app.enableMouseNavigationDarwin} />
        ) : undefined}
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
          label='Main Window Custom CSS'
          icon={<CodeIcon />}
          onClick={() => {
            this.setState({ customCSSEditorOpen: true })
          }} />
        <SettingsListItemButton
          divider={false}
          label='Site permissions'
          onClick={() => { window.location.hash = '/site_permissions' }} />
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
