import './SettingsScene.less'

const React = require('react')
const { Dialog, RaisedButton, FlatButton, Tabs, Tab } = require('material-ui')
const GeneralSettings = require('./General')
const AccountSettings = require('./Accounts/AccountSettings')
const ProSettings = require('./Pro')
const AdvancedSettings = require('./AdvancedSettings')
const Colors = require('material-ui/styles/colors')
const styles = require('./SettingStyles')
const { ipcRenderer } = window.nativeRequire('electron')
const shallowCompare = require('react-addons-shallow-compare')
const SettingsSceneTabTemplate = require('./SettingsSceneTabTemplate')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SettingsScene',
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  propTypes: {
    params: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: true,
      showRestart: false
    }
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Changes the tab
  */
  handleTabChange (value) {
    if (typeof (value) === 'string') {
      window.location.hash = `/settings/${value}`
    }
  },

  /**
  * Shows the option to restart
  */
  handleShowRestart () {
    this.setState({ showRestart: true })
  },

  /**
  * Closes the modal
  */
  handleClose () {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { showRestart, open } = this.state
    const { params } = this.props

    const buttons = showRestart ? (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' style={{ marginRight: 16 }} onClick={this.handleClose} />
        <RaisedButton label='Restart' primary onClick={() => ipcRenderer.send('relaunch-app', { })} />
      </div>
    ) : (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' primary onClick={this.handleClose} />
      </div>
    )

    const currentTab = params.tab || 'general'
    const tabHeadings = [
      ['General', 'general'],
      ['Accounts', 'accounts'],
      ['Wavebox Pro', 'pro'],
      ['Advanced', 'advanced']
    ]

    const heading = (
      <div style={styles.tabToggles}>
        {tabHeadings.map(([label, value]) => {
          return (
            <FlatButton
              key={value}
              label={label}
              style={Object.assign({}, styles.tabToggle, {
                borderBottomColor: currentTab === value ? Colors.lightBlueA100 : 'transparent'
              })}
              labelStyle={{
                color: currentTab === value ? Colors.white : Colors.lightBlue100
              }}
              backgroundColor={Colors.lightBlue600}
              hoverColor={Colors.lightBlue600}
              rippleColor={Colors.lightBlue900}
              onClick={() => this.handleTabChange(value)} />
          )
        })}
      </div>
    )

    return (
      <Dialog
        modal={false}
        contentStyle={styles.dialog}
        title={heading}
        actions={buttons}
        open={open}
        bodyClassName='ReactComponent-SettingsScene-Body'
        bodyStyle={{ padding: 0 }}
        titleStyle={{ padding: 0 }}
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <Tabs
          inkBarStyle={{ display: 'none' }}
          tabItemContainerStyle={{ display: 'none' }}
          value={currentTab}
          onChange={this.handleTabChange}
          tabTemplate={SettingsSceneTabTemplate}
          contentContainerClassName='ReactComponent-SettingsScene-TabBody'>
          <Tab label='General' value='general'>
            <GeneralSettings showRestart={this.handleShowRestart} />
          </Tab>
          <Tab label='Accounts' value='accounts'>
            <AccountSettings showRestart={this.handleShowRestart} mailboxId={params.tabArg} />
          </Tab>
          <Tab label='Wavebox Pro' value='pro'>
            <ProSettings showRestart={this.handleShowRestart} />
          </Tab>
          <Tab label='Advanced' value='advanced'>
            <AdvancedSettings showRestart={this.handleShowRestart} />
          </Tab>
        </Tabs>
      </Dialog>
    )
  }
})
