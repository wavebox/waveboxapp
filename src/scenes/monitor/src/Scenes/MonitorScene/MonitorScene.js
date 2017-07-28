import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ProcessMonitor from './ProcessMonitor'
import ConnectionMonitor from './ConnectionMonitor'
import { Paper } from 'material-ui'

const styles = {
  section: {
    margin: 8
  },
  title: {
    fontWeight: 300,
    marginTop: 8,
    paddingTop: 8,
    marginLeft: 8,
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.6)'
  }
}

export default class MonitorScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <div>
        <Paper style={styles.section}>
          <h2 style={styles.title}>Processes</h2>
          <ProcessMonitor style={styles.section} />
        </Paper>
        <Paper style={styles.section}>
          <h2 style={styles.title}>Sync Channels</h2>
          <ConnectionMonitor style={styles.section} />
        </Paper>
      </div>
    )
  }
}
