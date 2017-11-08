import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper, SelectField, MenuItem } from 'material-ui'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import { UISettings, ExtensionSettings } from 'shared/Models/Settings'

const SIDEBAR_NEWS_MODE_LABELS = {
  [UISettings.SIDEBAR_NEWS_MODES.NEVER]: 'Never',
  [UISettings.SIDEBAR_NEWS_MODES.UNREAD]: `When there's new items`,
  [UISettings.SIDEBAR_NEWS_MODES.ALWAYS]: 'Always'
}
const EXTENSION_LAYOUT_MODE_LABELS = {
  [ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_LEFT]: 'Left',
  [ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT.ALIGN_RIGHT]: 'Right'
}
const VIBRANCY_MODE_LABELS = {
  [UISettings.VIBRANCY_MODES.NONE]: 'None',
  [UISettings.VIBRANCY_MODES.LIGHT]: 'Light',
  [UISettings.VIBRANCY_MODES.MEDIUM_LIGHT]: 'Medium Light',
  [UISettings.VIBRANCY_MODES.DARK]: 'Dark',
  [UISettings.VIBRANCY_MODES.ULTRA_DARK]: 'Ultra Dark'
}

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
        <Paper zDepth={1} style={styles.paper}>
          <h1 style={styles.subheading}>User Interface</h1>
          <Toggle
            toggled={ui.showAppBadge}
            label='Show app unread badge'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowAppBadge(toggled)} />
          {process.platform === 'darwin' ? (
            <Toggle
              toggled={os.openLinksInBackground}
              label='Open links in background'
              labelPosition='right'
              onToggle={(evt, toggled) => settingsActions.setOpenLinksInBackground(toggled)} />
            ) : undefined}
          <Toggle
            toggled={ui.openHidden}
            label='Always start minimized'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setOpenHidden(toggled)} />
          <Toggle
            toggled={ui.showSleepableServiceIndicator}
            label='Allow services to indicate when sleeping'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowSleepableServiceIndicator(toggled)} />
          {process.platform === 'darwin' ? (
            <SelectField
              floatingLabelText='Translucent window backgrounds (experimental) (Requires Restart)'
              value={ui.vibrancyMode}
              fullWidth
              onChange={(evt, index, value) => {
                showRestart()
                settingsActions.setVibrancyMode(value)
              }}>
              {Object.keys(UISettings.VIBRANCY_MODES).map((value) => {
                return (
                  <MenuItem key={value} value={value} primaryText={VIBRANCY_MODE_LABELS[value]} />
                )
              })}
            </SelectField>
          ) : undefined}

          <hr style={styles.subsectionRule} />
          <h1 style={styles.subsectionheading}>Sidebar</h1>
          <Toggle
            toggled={ui.sidebarEnabled}
            label={(
              <span>
                <span>Show Sidebar </span>
                {(accelerators.toggleSidebar || '').split('+').map((i) => {
                  return i ? (<kbd key={i} style={styles.kbd}>{i}</kbd>) : undefined
                })}
              </span>
            )}
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setEnableSidebar(toggled)} />
          <Toggle
            toggled={ui.showSidebarSupport}
            label='Show Support in Sidebar'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowSidebarSupport(toggled)} />
          <SelectField
            floatingLabelText={`Show What's New in Sidebar`}
            value={ui.showSidebarNewsfeed}
            fullWidth
            onChange={(evt, index, value) => { settingsActions.setShowSidebarNewsfeed(value) }}>
            {Object.keys(UISettings.SIDEBAR_NEWS_MODES).map((value) => {
              return (
                <MenuItem key={value} value={value} primaryText={SIDEBAR_NEWS_MODE_LABELS[value]} />
              )
            })}
          </SelectField>

          <hr style={styles.subsectionRule} />
          <h1 style={styles.subsectionheading}>Titlebar</h1>
          <Toggle
            labelPosition='right'
            toggled={ui.showTitlebar}
            label={process.platform === 'darwin' ? (
              'Show titlebar (Requires Restart)'
            ) : (
              <span>Show titlebar (Requires Restart) <span style={{ color: '#CCC', fontSize: '85%' }}>(Experimental)</span></span>
            )}
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.setShowTitlebar(toggled)
            }} />
          {process.platform !== 'darwin' ? (
            <Toggle
              labelPosition='right'
              toggled={ui.showAppMenu}
              label={(
                <span>
                  <span>Show titlebar Menu </span>
                  {(accelerators.toggleMenu || '').split('+').map((i) => {
                    return i ? (<kbd key={i} style={styles.kbd}>{i}</kbd>) : undefined
                  })}
                </span>
              )}
              onToggle={(evt, toggled) => settingsActions.setShowAppMenu(toggled)} />
          ) : undefined}
          <Toggle
            toggled={ui.showTitlebarCount}
            label='Show titlebar unread count'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowTitlebarUnreadCount(toggled)} />
          <Toggle
            toggled={ui.showTitlebarAccount}
            label='Show titlebar active account'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowTitlebarAccount(toggled)} />
          {extension.enableChromeExperimental ? (
            <div>
              <hr style={styles.subsectionRule} />
              <h1 style={styles.subsectionheading}>Toolbar</h1>
              <Toggle
                toggled={extension.showBrowserActionsInToolbar}
                label='Show extensions in toolbar'
                labelPosition='right'
                onToggle={(evt, toggled) => settingsActions.setExtensionShowBrowserActionsInToolbar(toggled)} />
              <SelectField
                floatingLabelText='Extension position in toolbar'
                value={extension.toolbarBrowserActionLayout}
                disabled={!extension.showBrowserActionsInToolbar}
                fullWidth
                onChange={(evt, index, value) => { settingsActions.setExtensionToolbarBrowserActionLayout(value) }}>
                {Object.keys(ExtensionSettings.TOOLBAR_BROWSER_ACTION_LAYOUT).map((value) => {
                  return (
                    <MenuItem
                      key={value}
                      value={value}
                      primaryText={EXTENSION_LAYOUT_MODE_LABELS[value]} />
                  )
                })}
              </SelectField>
            </div>
          ) : undefined}
        </Paper>
      </div>
    )
  }
}
