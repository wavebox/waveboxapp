const React = require('react')
const { Toggle, Paper } = require('material-ui')
const { settingsStore, settingsActions } = require('stores/settings')
const styles = require('./SettingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AdvancedSettings',
  propTypes: {
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState (settingsState = settingsStore.getState()) {
    return {
      app: settingsState.app
    }
  },

  getInitialState () {
    return this.generateState()
  },

  settingsChanged (store) {
    this.setState(this.generateState(store))
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { app } = this.state
    const { showRestart, ...passProps } = this.props

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <Toggle
            toggled={app.ignoreGPUBlacklist}
            label='Ignore GPU Blacklist (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.ignoreGPUBlacklist(toggled)
            }} />
          <Toggle
            toggled={app.enableUseZoomForDSF}
            label='Use Zoom For DSF (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.enableUseZoomForDSF(toggled)
            }} />
          <Toggle
            toggled={app.disableSmoothScrolling}
            label='Disable Smooth Scrolling (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.disableSmoothScrolling(toggled)
            }} />
          <Toggle
            toggled={app.checkForUpdates}
            label='Check for updates'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              settingsActions.checkForUpdates(toggled)
            }} />
        </Paper>
      </div>
    )
  }
})
