import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import { UISettings, ExtensionSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import SettingsListKeyboardShortcutText from 'wbui/SettingsListKeyboardShortcutText'
import SettingsListItemTextFieldInline from 'wbui/SettingsListItemTextFieldInline'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import teal from '@material-ui/core/colors/teal'

export default class UISettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ui: PropTypes.object.isRequired,
    accelerators: PropTypes.object.isRequired,
    extension: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.ui, nextProps.ui, [
        'showAppBadge',
        'openHidden',
        'showSleepableServiceIndicator',
        'vibrancyMode',
        'accountTooltipMode',
        'accountTooltipInteractive',
        'accountTooltipDelay',
        'sidebarEnabled',
        'sidebarActiveIndicator',
        'showSidebarSupport',
        'showSidebarNewsfeed',
        'showSidebarDownloads',
        'setShowSidebarBusy',
        'showTitlebar',
        'showAppMenu',
        'showTitlebarCount',
        'showTitlebarAccount',
        'theme',
        'sidebarSize',
        'showSidebarScrollbars',
        'warnBeforeKeyboardQuitting',
        'showFullscreenHelper'
      ]) ||
      modelCompare(this.props.accelerators, nextProps.accelerators, [
        'toggleSidebar',
        'toggleMenu',
        'quit'
      ]) ||
      modelCompare(this.props.extension, nextProps.extension, ['showBrowserActionsInToolbar', 'toolbarBrowserActionLayout']) ||
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
      ui,
      extension,
      accelerators,
      showRestart,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <SettingsListSection title='User Interface' icon={<ViewQuiltIcon />}>
          <SettingsListItemSwitch
            label='Show app unread badge'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowAppBadge(toggled)}
            checked={ui.showAppBadge} />
          <SettingsListItemSwitch
            label='Always start minimized'
            onChange={(evt, toggled) => settingsActions.sub.ui.setOpenHidden(toggled)}
            checked={ui.openHidden} />
          <SettingsListItemSwitch
            label='Show sleeping account icons in grey'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowSleepableServiceIndicator(toggled)}
            checked={ui.showSleepableServiceIndicator} />
          <SettingsListItemSwitch
            label={(
              <span>
                <span>Warn before quitting with </span>
                <SettingsListKeyboardShortcutText shortcut={accelerators.quit} />
              </span>
            )}
            onChange={(evt, toggled) => settingsActions.sub.ui.setWarnBeforeKeyboardQuitting(toggled)}
            checked={ui.warnBeforeKeyboardQuitting} />
          <SettingsListItemSwitch
            label='Show toast helper when entering fullscreen'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowFullscreenHelper(toggled)}
            checked={ui.showFullscreenHelper} />
          <SettingsListItemSelectInline
            label='App theme'
            divider={process.platform === 'darwin'}
            value={ui.theme}
            options={[
              { value: UISettings.THEMES.DARK, label: 'Dark' },
              { value: UISettings.THEMES.LIGHT, label: 'Light' },
              {
                value: UISettings.THEMES.BOXY_BLUE,
                label: 'Boxy Blue',
                MenuItemProps: {
                  style: { borderRight: `20px solid #5B9ECA` }
                }
              },
              {
                value: UISettings.THEMES.BOXY_PURPLE,
                label: 'Boxy Purple',
                MenuItemProps: {
                  style: { borderRight: `20px solid #7676B0` }
                }
              },
              {
                value: UISettings.THEMES.NAVY,
                label: 'Navy',
                MenuItemProps: {
                  style: { borderRight: '20px solid rgb(0,113,158)' }
                }
              },
              {
                value: UISettings.THEMES.TEAL,
                label: 'Teal',
                MenuItemProps: {
                  style: { borderRight: `20px solid ${teal[600]}` }
                }
              },
              {
                value: UISettings.THEMES.WAVEBOX_LIGHT_BLUE,
                label: 'Wavebox light blue',
                MenuItemProps: {
                  style: { borderRight: `20px solid #00AEEF` }
                }
              },
              {
                value: UISettings.THEMES.WAVY_BLUE,
                label: 'Wavy Blue',
                MenuItemProps: {
                  style: { borderRight: `20px solid #016084` }
                }
              },
              {
                value: UISettings.THEMES.WAVY_GREEN,
                label: 'Wavy Green',
                MenuItemProps: {
                  style: { borderRight: `20px solid #73ACB5` }
                }
              }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setTheme(value)} />
          {process.platform === 'darwin' ? (
            <SettingsListItemSelectInline
              label='Translucent window backgrounds (Requires Restart)'
              divider={false}
              secondary='(Experimental)'
              value={ui.vibrancyMode}
              options={[
                { value: UISettings.VIBRANCY_MODES.NONE, label: 'None' },
                { value: UISettings.VIBRANCY_MODES.LIGHT, label: 'Light' },
                { value: UISettings.VIBRANCY_MODES.MEDIUM_LIGHT, label: 'Medium Light' },
                { value: UISettings.VIBRANCY_MODES.DARK, label: 'Dark' },
                { value: UISettings.VIBRANCY_MODES.ULTRA_DARK, label: 'Ultra Dark' }
              ]}
              onChange={(evt, value) => {
                showRestart()
                settingsActions.sub.ui.setVibrancyMode(value)
              }} />
          ) : undefined}
        </SettingsListSection>
        <SettingsListSection title='User Interface' subtitle='Tooltips' icon={<ViewQuiltIcon />}>
          <SettingsListItemSelectInline
            label='Account tooltips'
            value={ui.accountTooltipMode}
            options={[
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED, label: 'Show', primaryText: 'Show in Sidebar & Toolbar' },
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.DISABLED, label: 'Hide', primaryText: 'Hide all' },
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY, label: 'Sidebar Only', primaryText: 'Show only in the Sidebar' },
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.TOOLBAR_ONLY, label: 'Toolbar Only', primaryText: 'Show only in the Toolbar' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setAccountTooltipMode(value)} />
          <SettingsListItemSwitch
            label='Show Recent, Pinned & Tasks in Account tooltips'
            onChange={(evt, toggled) => settingsActions.sub.ui.setAccountTooltipInteractive(toggled)}
            disabled={ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.DISABLED}
            checked={ui.accountTooltipInteractive} />
          <SettingsListItemTextFieldInline
            label='Account tooltip show delay (ms)'
            divider={false}
            disabled={ui.accountTooltipMode === UISettings.ACCOUNT_TOOLTIP_MODES.DISABLED}
            textFieldProps={{
              defaultValue: ui.accountTooltipDelay,
              type: 'number',
              placeholder: '750',
              onBlur: (evt) => {
                settingsActions.sub.ui.setAccountTooltipDelay(parseInt(evt.target.value))
              }
            }} />
        </SettingsListSection>

        <SettingsListSection title='User Interface' subtitle='Sidebar' icon={<ViewQuiltIcon />}>
          <SettingsListItemSwitch
            label={(
              <span>
                <span>Show Sidebar </span>
                <SettingsListKeyboardShortcutText shortcut={accelerators.toggleSidebar} />
              </span>
            )}
            onChange={(evt, toggled) => settingsActions.sub.ui.setEnableSidebar(toggled)}
            checked={ui.sidebarEnabled} />
          <SettingsListItemSwitch
            label='Show scrollbar in Sidebar'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowSidebarScrollbars(toggled)}
            checked={ui.showSidebarScrollbars} />
          <SettingsListItemSelectInline
            label='Sidebar Size'
            value={ui.sidebarSize}
            options={[
              { value: UISettings.SIDEBAR_SIZES.REGULAR, label: 'Regular' },
              { value: UISettings.SIDEBAR_SIZES.COMPACT, label: 'Compact' },
              { value: UISettings.SIDEBAR_SIZES.TINY, label: 'Tiny' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setSidebarSize(value)} />
          <SettingsListItemSelectInline
            label='Active account indicator'
            value={ui.sidebarActiveIndicator}
            options={[
              { value: UISettings.SIDEBAR_ACTIVE_INDICATOR.DOT, label: 'Dot' },
              { value: UISettings.SIDEBAR_ACTIVE_INDICATOR.BANNER, label: 'Banner (Account color)' },
              { value: UISettings.SIDEBAR_ACTIVE_INDICATOR.BANNER_THEME, label: 'Banner (Theme color)' },
              { value: UISettings.SIDEBAR_ACTIVE_INDICATOR.BAR, label: 'Bar (Account color)' },
              { value: UISettings.SIDEBAR_ACTIVE_INDICATOR.BAR_THEME, label: 'Bar (Theme color)' },
              { value: UISettings.SIDEBAR_ACTIVE_INDICATOR.NONE, label: 'None' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setSidebarActiveIndicator(value)} />
          <SettingsListItemSwitch
            label='Show Activity in Sidebar'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowSidebarBusy(toggled)}
            checked={ui.showSidebarBusy} />
          <SettingsListItemSelectInline
            label={`Show Downloads in Sidebar`}
            value={ui.showSidebarDownloads}
            options={[
              { value: UISettings.SIDEBAR_DOWNLOAD_MODES.NEVER, label: 'Never' },
              { value: UISettings.SIDEBAR_DOWNLOAD_MODES.ACTIVE, label: `When there are active downloads` },
              { value: UISettings.SIDEBAR_DOWNLOAD_MODES.ALWAYS, label: 'Always' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setShowSidebarDownloads(value)} />
          <SettingsListItemSelectInline
            label={`Show What's New in Sidebar`}
            value={ui.showSidebarNewsfeed}
            options={[
              { value: UISettings.SIDEBAR_NEWS_MODES.NEVER, label: 'Never' },
              { value: UISettings.SIDEBAR_NEWS_MODES.UNREAD, label: `When there's new items` },
              { value: UISettings.SIDEBAR_NEWS_MODES.ALWAYS, label: 'Always' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setShowSidebarNewsfeed(value)} />
          <SettingsListItemSwitch
            divider={false}
            label='Show Support in Sidebar'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowSidebarSupport(toggled)}
            checked={ui.showSidebarSupport} />
        </SettingsListSection>

        <SettingsListSection title='User Interface' subtitle='Titlebar' icon={<ViewQuiltIcon />}>
          <SettingsListItemSwitch
            label='Show titlebar (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.ui.setShowTitlebar(toggled)
            }}
            checked={ui.showTitlebar} />
          {process.platform !== 'darwin' ? (
            <SettingsListItemSwitch
              label={(
                <span>
                  <span>Show titlebar Menu </span>
                  <SettingsListKeyboardShortcutText shortcut={accelerators.toggleMenu} />
                </span>
              )}
              onChange={(evt, toggled) => settingsActions.sub.ui.setShowAppMenu(toggled)}
              checked={ui.showAppMenu} />
          ) : undefined}
          <SettingsListItemSwitch
            label='Show titlebar unread count'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowTitlebarUnreadCount(toggled)}
            checked={ui.showTitlebarCount} />
          <SettingsListItemSwitch
            divider={false}
            label='Show titlebar active account'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowTitlebarAccount(toggled)}
            checked={ui.showTitlebarAccount} />
        </SettingsListSection>

        <SettingsListSection title='User Interface' subtitle='Toolbar' icon={<ViewQuiltIcon />}>
          <SettingsListItemSwitch
            label='Show extensions in toolbar'
            onChange={(evt, toggled) => settingsActions.sub.extension.setShowBrowserActionsInToolbar(toggled)}
            checked={extension.showBrowserActionsInToolbar} />
          <SettingsListItemSelectInline
            divider={false}
            label='Extension position in toolbar'
            value={extension.toolbarBrowserActionLayout}
            disabled={!extension.showBrowserActionsInToolbar}
            options={[
              { value: ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT, label: 'Left' },
              { value: ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT, label: 'Right' }
            ]}
            onChange={(evt, value) => settingsActions.sub.extension.setToolbarBrowserActionLayout(value)} />
        </SettingsListSection>
      </div>
    )
  }
}
