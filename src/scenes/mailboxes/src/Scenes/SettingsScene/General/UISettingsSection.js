import PropTypes from 'prop-types'
import React from 'react'
import { Toggle, Paper } from 'material-ui'
import settingsActions from 'stores/settings/settingsActions'
import styles from '../SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class UISettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ui: PropTypes.object.isRequired,
    os: PropTypes.object.isRequired,
    accelerators: PropTypes.object.isRequired,
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
      accelerators,
      showRestart,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <h1 style={styles.subheading}>User Interface</h1>
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
            toggled={ui.showAppBadge}
            label='Show app unread badge'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowAppBadge(toggled)} />
          <Toggle
            toggled={ui.showTitlebarCount}
            label='Show titlebar unread count'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowTitlebarUnreadCount(toggled)} />
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
        </Paper>
      </div>
    )
  }
}
