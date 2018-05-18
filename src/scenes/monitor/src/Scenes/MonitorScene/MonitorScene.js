import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ProcessMonitor from './ProcessMonitor'
import ConnectionMonitor from './ConnectionMonitor'
import { Paper } from 'material-ui'
import { withStyles } from 'material-ui/styles'

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

@withStyles(styles)
class MonitorScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    return (
      <div>
        <Paper className={classes.section}>
          <h2 className={classes.title}>Processes</h2>
          <ProcessMonitor className={styles.section} />
        </Paper>
        <Paper className={classes.section}>
          <h2 className={classes.title}>Sync Channels</h2>
          <ConnectionMonitor className={classes.section} />
        </Paper>
      </div>
    )
  }
}

export default MonitorScene
