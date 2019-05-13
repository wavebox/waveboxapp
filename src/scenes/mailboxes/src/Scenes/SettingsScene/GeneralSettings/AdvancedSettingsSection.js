import PropTypes from 'prop-types'
import React from 'react'
import { ipcRenderer } from 'electron'
import { settingsActions } from 'stores/settings'
import { userStore } from 'stores/user'
import CustomCodeEditingDialog from 'Components/CustomCodeEditingDialog'
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
import { WB_OPEN_CERTIFICATES_FOLDER } from 'shared/ipcEvents'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'

const styles = {}

@withStyles(styles)
class AdvancedSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired,
    language: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    os: PropTypes.object.isRequired
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
        'polyfillUserAgents',
        'concurrentServiceLoadLimit',
        'searchProvider',
        'forceWindowPaintOnRestore',
        'showArtificiallyPersistCookies',
        'touchBarSupportEnabled'
      ]) ||
      modelCompare(this.props.language, nextProps.language, [
        'inProcessSpellchecking'
      ]) ||
      modelCompare(this.props.ui, nextProps.ui, [
        'customMainCSS',
        'showCtxMenuAdvancedLinkOptions'
      ]) ||
      modelCompare(this.props.os, nextProps.os, [
        'rawUseAsyncDownloadHandler',
        'rawNotificationsMutedWhenSuspended'
      ]) ||
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
      os,
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
            label='Process Sandboxing (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.app.setEnableMixedSandboxMode(toggled)
            }}
            checked={app.enableMixedSandboxMode} />
        ) : undefined}
        <SettingsListItemSwitch
          label='Automatically Polyfill UserAgents (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.setPolyfillUserAgents(toggled)
          }}
          checked={app.polyfillUserAgents} />
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
        {DistributionConfig.isSnapInstall ? undefined : (
          <SettingsListItemSwitch
            label='Autofill passwords on right click'
            onChange={(evt, toggled) => { settingsActions.sub.app.setEnableAutofillServie(toggled) }}
            checked={app.enableAutofillService} />
        )}
        <SettingsListItemSwitch
          label='Show advanced link options on right click (experimental)'
          onChange={(evt, toggled) => { settingsActions.sub.ui.setShowCtxMenuAdvancedLinkOptions(toggled) }}
          checked={ui.showCtxMenuAdvancedLinkOptions} />
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
              <p>
                Other link tools (e.g. changeable behaviour with Shift+Click) are
                not available with this option disabled
              </p>
              <p>
                It's highly recommended keeping this setting enabled
              </p>
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
        <SettingsListItemSwitch
          label='Experimental Download Handler'
          onChange={(evt, toggled) => settingsActions.sub.os.setUseAsyncDownloadHandler(toggled)}
          checked={userStore.getState().wceUseAsyncDownloadHandler(os.rawUseAsyncDownloadHandler)} />
        <SettingsListItemSwitch
          label='Auto mute notifications when suspended'
          onChange={(evt, toggled) => settingsActions.sub.os.setNotificationsMutedWhenSuspended(toggled)}
          checked={userStore.getState().wceNotificationsMutedWhenSuspended(os.rawNotificationsMutedWhenSuspended)} />
        <SettingsListItemSwitch
          label='Force window repaint on restore (Requires Restart)'
          onChange={(evt, toggled) => {
            showRestart()
            settingsActions.sub.app.setForceWindowPaintOnRestore(toggled)
          }}
          checked={app.forceWindowPaintOnRestore} />
        <SettingsListItemSwitch
          label='Show "Artificially Persist Cookies" option on accounts'
          onChange={(evt, toggled) => settingsActions.sub.app.setShowArtificiallyPersistCookies(toggled)}
          checked={app.showArtificiallyPersistCookies} />
        {process.platform === 'darwin' ? (
          <SettingsListItemSwitch
            label='Experimental touchbar support (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.app.setTouchBarSupportEnabled(toggled)
            }}
            checked={app.touchBarSupportEnabled} />
        ) : undefined}
        <SettingsListItemSelectInline
          label='Concurrent service load limit (Requires Restart)'
          value={app.concurrentServiceLoadLimit}
          options={[
            { value: 0, label: 'Auto', primaryText: 'Auto (Recommended)' },
            { value: -1, label: 'Unlimited (Not Recommended)' },
            { divider: true }
          ].concat(
            Array.from(Array(20)).map((_, i) => {
              return { value: i + 1, label: `${i + 1}` }
            })
          )}
          onChange={(evt, value) => {
            showRestart()
            settingsActions.sub.app.setConcurrentServiceLoadLimit(value)
          }} />
        <SettingsListItemSelectInline
          label='Search Provider'
          value={app.searchProvider}
          options={[
            {
              value: AppSettings.SEARCH_PROVIDERS.GOOGLE,
              label: AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.GOOGLE],
              primaryText: AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.GOOGLE]
            },
            {
              value: AppSettings.SEARCH_PROVIDERS.GOOGLE_WB,
              label: `${AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.GOOGLE_WB]} (Wavebox)`,
              primaryText: `${AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.GOOGLE_WB]} - Opens in Wavebox`
            },
            {
              value: AppSettings.SEARCH_PROVIDERS.BING,
              label: AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.BING],
              primaryText: AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.BING]
            },
            {
              value: AppSettings.SEARCH_PROVIDERS.BING_WB,
              label: `${AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.BING_WB]} (Wavebox)`,
              primaryText: `${AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.BING_WB]} - Opens in Wavebox`
            },
            {
              value: AppSettings.SEARCH_PROVIDERS.DUCK_DUCK,
              label: AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.DUCK_DUCK],
              primaryText: AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.DUCK_DUCK]
            },
            {
              value: AppSettings.SEARCH_PROVIDERS.DUCK_DUCK_WB,
              label: `${AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.DUCK_DUCK_WB]} (Wavebox)`,
              primaryText: `${AppSettings.SEARCH_PROVIDER_NAMES[AppSettings.SEARCH_PROVIDERS.DUCK_DUCK_WB]} - Opens in Wavebox`
            }
          ]}
          onChange={(evt, value) => settingsActions.sub.app.setSearchProvider(value)} />
        <SettingsListItemButton
          label='Main Window Custom CSS'
          icon={<CodeIcon />}
          onClick={() => {
            this.setState({ customCSSEditorOpen: true })
          }} />
        <SettingsListItemButton
          label='Site permissions'
          onClick={() => { window.location.hash = '/site_permissions' }} />
        <SettingsListItemButton
          label='Custom HTTPS Certificates'
          divider={false}
          onClick={() => {
            ipcRenderer.send(WB_OPEN_CERTIFICATES_FOLDER)
          }} />
        <CustomCodeEditingDialog
          title='Main Window Custom CSS'
          open={customCSSEditorOpen}
          code={ui.customMainCSS}
          mode='css'
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
