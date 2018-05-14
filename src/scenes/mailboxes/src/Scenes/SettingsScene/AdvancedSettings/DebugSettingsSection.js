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
            onClick={() => settingsActions.sub.app.openMetricsMonitor()} />
        </div>
        <Toggle
          toggled={app.writeMetricsLog}
          label='Write app metrics log'
          labelPosition='right'
          onToggle={(evt, toggled) => {
            settingsActions.sub.app.setWriteMetricsLog(toggled)
          }} />
        <div
          style={{...styles.link}}
          onClick={() => settingsActions.sub.app.openMetricsLog()}>
          <small>Open metrics log</small>
        </div>
      </Paper>
    )
  }
}
