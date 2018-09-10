import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ProcessMonitor from './ProcessMonitor'
import ConnectionMonitor from './ConnectionMonitor'
import { Paper, AppBar, Toolbar, FormGroup, FormControlLabel, Switch } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  root: {
    paddingTop: 48
  },
  section: {
    margin: 8
  },
  sectionTitle: {
    fontWeight: 300,
    marginTop: 8,
    paddingTop: 8,
    marginLeft: 8,
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.6)'
  },
  toolbar: {
    minHeight: 48,
    justifyContent: 'flex-end'
  }
}

@withStyles(styles)
class MonitorScene extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    isAdvanced: false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { isAdvanced } = this.state

    return (
      <div className={classes.root}>
        <AppBar position='fixed' color='default'>
          <Toolbar className={classes.toolbar}>
            <FormGroup>
              <FormControlLabel
                label='Advanced Mode'
                control={
                  <Switch
                    checked={isAdvanced}
                    color='primary'
                    onChange={(evt, toggled) => this.setState({ isAdvanced: toggled })} />
                } />
            </FormGroup>
          </Toolbar>
        </AppBar>
        <Paper className={classes.section}>
          <h2 className={classes.sectionTitle}>Processes</h2>
          <ProcessMonitor isAdvanced={isAdvanced} />
        </Paper>
        <Paper className={classes.section}>
          <h2 className={classes.sectionTitle}>Sync Channels</h2>
          <ConnectionMonitor />
        </Paper>
      </div>
    )
  }
}

export default MonitorScene
