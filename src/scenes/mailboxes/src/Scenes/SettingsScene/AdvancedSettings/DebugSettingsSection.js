import PropTypes from 'prop-types'
import React from 'react'
import { Paper, Toggle, FontIcon, FlatButton } from 'material-ui'
import { settingsActions } from 'stores/settings'
import styles from '../CommonSettingStyles'
import shallowCompare from 'react-addons-shallow-compare'

export default class DebugSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, app, style, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={{...styles.paper, ...style}} {...passProps}>
        <h1 style={styles.subheading}>Debugging</h1>
        <div style={{ marginBottom: 16 }}>
          <FlatButton
            style={{ marginRight: 8 }}
            label='Task Monitor'
            icon={<FontIcon className='material-icons'>timeline</FontIcon>}
            onClick={() => settingsActions.openMetricsMonitor()} />
          <FlatButton
            label='Free V8 Memory'
            onClick={() => settingsActions.freeMetricsV8Memory()} />
          <FlatButton
            label='Classic Add Screen'
            icon={<FontIcon className='material-icons'>add_circle</FontIcon>}
            onClick={() => {
              window.location.hash = '/mailbox_wizard/add_classic'
            }} />
        </div>
        <Toggle
          toggled={app.writeMetricsLog}
          label='Write app metrics log'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            settingsActions.setWriteMetricsLog(toggled)
          }} />
        <div
          style={{...styles.link}}
          onClick={() => settingsActions.openMetricsLog()}>
          <small>Open metrics log</small>
        </div>
      </Paper>
    )
  }
}
