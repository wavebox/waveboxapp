import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import shallowCompare from 'react-addons-shallow-compare'
import { UISettings, ExtensionSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import SettingsListSelect from 'wbui/SettingsListSelect'
import SettingsListKeyboardShortcutText from 'wbui/SettingsListKeyboardShortcutText'

export default class UISettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ui: PropTypes.object.isRequired,
    os: PropTypes.object.isRequired,
    accelerators: PropTypes.object.isRequired,
    extension: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      ui,
      os,
      extension,
      accelerators,
      showRestart,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <SettingsListSection title='User Interface'>
          <SettingsListSwitch
            label='Show app unread badge'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowAppBadge(toggled)}
            checked={ui.showAppBadge} />
          {process.platform === 'darwin' ? (
            <SettingsListSwitch
              label='Open links in background'
              onChange={(evt, toggled) => settingsActions.sub.os.setOpenLinksInBackground(toggled)}
              checked={os.openLinksInBackground} />
          ) : undefined}
          <SettingsListSwitch
            label='Always start minimized'
            onChange={(evt, toggled) => settingsActions.sub.ui.setOpenHidden(toggled)}
            checked={ui.openHidden} />
          <SettingsListSwitch
            label='Show sleeping account icons in grey'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowSleepableServiceIndicator(toggled)}
            checked={ui.showSleepableServiceIndicator} />
          <SettingsListSwitch
            label='Show one-time sleep notification for each account'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowDefaultServiceSleepNotifications(toggled)}
            checked={ui.showDefaultServiceSleepNotifications} />
          {process.platform === 'darwin' ? (
            <SettingsListSelect
              label='Translucent window backgrounds (Requires Restart)'
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
          <SettingsListSelect
            divider={false}
            label='Account tooltips'
            value={ui.accountTooltipMode}
            options={[
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.ENABLED, label: 'Show', primaryText: 'Show in Sidebar & Toolbar' },
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.DISABLED, label: 'Hide', primaryText: 'Hide all' },
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.SIDEBAR_ONLY, label: 'Sidebar Only', primaryText: 'Show only in the Sidebar' },
              { value: UISettings.ACCOUNT_TOOLTIP_MODES.TOOLBAR_ONLY, label: 'Toolbar Only', primaryText: 'Show only in the Toolbar' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setAccountTooltipMode(value)} />
        </SettingsListSection>

        <SettingsListSection title='User Interface' subtitle='Sidebar'>
          <SettingsListSwitch
            label={(
              <span>
                <span>Show Sidebar </span>
                <SettingsListKeyboardShortcutText shortcut={accelerators.toggleSidebar} />
              </span>
            )}
            onChange={(evt, toggled) => settingsActions.sub.ui.setEnableSidebar(toggled)}
            checked={ui.sidebarEnabled} />
          <SettingsListSwitch
            label='Show Support in Sidebar'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowSidebarSupport(toggled)}
            checked={ui.showSidebarSupport} />
          <SettingsListSelect
            divider={false}
            label={`Show What's New in Sidebar`}
            value={ui.showSidebarNewsfeed}
            options={[
              { value: UISettings.SIDEBAR_NEWS_MODES.NEVER, label: 'Never' },
              { value: UISettings.SIDEBAR_NEWS_MODES.UNREAD, label: `When there's new items` },
              { value: UISettings.SIDEBAR_NEWS_MODES.ALWAYS, label: 'Always' }
            ]}
            onChange={(evt, value) => settingsActions.sub.ui.setShowSidebarNewsfeed(value)} />
        </SettingsListSection>

        <SettingsListSection title='User Interface' subtitle='Titlebar'>
          <SettingsListSwitch
            label='Show titlebar (Requires Restart)'
            onChange={(evt, toggled) => {
              showRestart()
              settingsActions.sub.ui.setShowTitlebar(toggled)
            }}
            checked={ui.showTitlebar} />
          {process.platform !== 'darwin' ? (
            <SettingsListSwitch
              label={(
                <span>
                  <span>Show titlebar Menu </span>
                  <SettingsListKeyboardShortcutText shortcut={accelerators.toggleMenu} />
                </span>
              )}
              onChange={(evt, toggled) => settingsActions.sub.ui.setShowAppMenu(toggled)}
              checked={ui.showAppMenu} />
          ) : undefined}
          <SettingsListSwitch
            label='Show titlebar unread count'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowTitlebarUnreadCount(toggled)}
            checked={ui.showTitlebarCount} />
          <SettingsListSwitch
            divider={false}
            label='Show titlebar active account'
            onChange={(evt, toggled) => settingsActions.sub.ui.setShowTitlebarAccount(toggled)}
            checked={ui.showTitlebarAccount} />
        </SettingsListSection>

        <SettingsListSection title='User Interface' subtitle='Toolbar'>
          <SettingsListSwitch
            label='Show extensions in toolbar'
            onChange={(evt, toggled) => settingsActions.sub.extension.setShowBrowserActionsInToolbar(toggled)}
            checked={extension.showBrowserActionsInToolbar} />
          <SettingsListSelect
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
