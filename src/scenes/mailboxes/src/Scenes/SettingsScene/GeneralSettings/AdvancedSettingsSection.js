import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import CustomStylesEditingDialog from './CustomStylesEditingDialog'
import DistributionConfig from 'Runtime/DistributionConfig'
import { AppSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from 'material-ui/styles'
import WarningIcon from '@material-ui/icons/Warning'
import CodeIcon from '@material-ui/icons/Code'
import grey from 'material-ui/colors/grey'
import amber from 'material-ui/colors/amber'
import { Button } from 'material-ui'

const styles = {
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18
  },
  extraInfo: {
    fontSize: '75%',
    color: grey[700]
  },
  extraInfoWarning: {
    fontSize: '75%',
    color: amber[700]
  },
  extraInfoWarningIcon: {
    marginRight: 6,
    height: 18,
    width: 18
  }
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
      <SettingsListSection {...passProps} title='Advanced'>
        <SettingsListSwitch
          label='Ignore GPU Blacklist (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.ignoreGPUBlacklist(toggled)
          }}
          checked={app.ignoreGPUBlacklist} />
        <SettingsListSwitch
          label='Hardware acceleration (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.disableHardwareAcceleration(!toggled)
          }}
          checked={!app.disableHardwareAcceleration} />
        <SettingsListSwitch
          label='Isolate Account Processes (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.setIsolateMailboxProcesses(toggled)
          }}
          checked={app.isolateMailboxProcesses} />
        {AppSettings.SUPPORTS_MIXED_SANDBOX_MODE ? (
          <SettingsListSwitch
            label='Enable Sanboxing (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.app.setEnableMixedSandboxMode(toggled)
            }}
            checked={app.enableMixedSandboxMode} />
        ) : undefined}
        <SettingsListSwitch
          label='Use Zoom For DSF (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.enableUseZoomForDSF(toggled)
          }}
          checked={app.enableUseZoomForDSF} />
        <SettingsListSwitch
          label='Smooth Scrolling (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.disableSmoothScrolling(!toggled)
          }}
          checked={!app.disableSmoothScrolling} />
        <SettingsListSwitch
          label='Geolocation API'
          onChange={(evt, toggled) => { settingsActions.sub.app.setEnableGeolocationApi(toggled) }}
          checked={app.enableGeolocationApi} />
        {DistributionConfig.isSnapInstall ? undefined : (
          <SettingsListSwitch
            label='Autofill passwords on right click'
            onChange={(evt, toggled) => { settingsActions.sub.app.setEnableAutofillServie(toggled) }}
            checked={app.enableAutofillService} />
        )}
        <SettingsListSwitch
          label='In process spellchecking (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.language.setInProcessSpellchecking(toggled)
          }}
          checked={language.inProcessSpellchecking} />
        <SettingsListSwitch
          label='Window opening engine (Recommended)'
          secondary={app.enableWindowOpeningEngine === false ? (
            <span style={styles.extraInfoWarning}>
              <WarningIcon className={classes.extraInfoWarningIcon} />
              All links will open in your default browser. You may experience
              broken links and blank windows with this setting
            </span>
          ) : (
            <span style={styles.extraInfo}>
              Some links will continue to open with Wavebox to give the best experience and the
              remaining links will open using your per-account configuration
            </span>
          )}
          onChange={(evt, toggled) => {
            settingsActions.sub.app.setEnableWindowOpeningEngine(toggled)
          }}
          checked={app.enableWindowOpeningEngine} />
        <SettingsListItem divider={false}>
          <Button size='small' variant='raised' onClick={() => this.setState({ customCSSEditorOpen: true })}>
            <CodeIcon className={classes.buttonIcon} />
            Main Window Custom CSS
          </Button>
          <CustomStylesEditingDialog
            title='Main Window Custom CSS'
            open={customCSSEditorOpen}
            code={ui.customMainCSS}
            onCancel={() => this.setState({ customCSSEditorOpen: false })}
            onSave={(evt, css) => {
              this.setState({ customCSSEditorOpen: false })
              settingsActions.sub.ui.setCustomMainCSS(css)
            }} />
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}

export default AdvancedSettingsSection
