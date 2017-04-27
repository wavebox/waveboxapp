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
              label='Show titlebar Menu (Ctrl+\)'
              onToggle={(evt, toggled) => settingsActions.setShowAppMenu(toggled)} />
          ) : undefined}
          <Toggle
            toggled={ui.sidebarEnabled}
            label={`Show Sidebar (${process.platform === 'darwin' ? 'Ctrl+cmd+S' : 'Ctrl+alt+S'})`}
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
            label='Always Start minimized'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setOpenHidden(toggled)} />
        </Paper>
      </div>
    )
  }
}
