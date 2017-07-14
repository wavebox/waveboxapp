import PropTypes from 'prop-types'
import './SettingsScene.less'
import React from 'react'
import { Dialog, RaisedButton, FlatButton, Tabs, Tab } from 'material-ui'
import GeneralSettings from './General'
import AccountSettings from './Accounts/AccountSettings'
import ProSettings from './Pro'
import AdvancedSettings from './Advanced'
import * as Colors from 'material-ui/styles/colors'
import styles from './SettingStyles'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsSceneTabTemplate from './SettingsSceneTabTemplate'
import { WB_RELAUNCH_APP } from 'shared/ipcEvents'

const { ipcRenderer } = window.nativeRequire('electron')

export default class SettingsScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        tab: PropTypes.string,
        tabArg: PropTypes.string
      })
    })
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      showRestart: false
    }
  })()

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Changes the tab
  */
  handleTabChange = (value) => {
    if (typeof (value) === 'string') {
      window.location.hash = `/settings/${value}`
    }
  }

  /**
  * Shows the option to restart
  */
  handleShowRestart = () => {
    this.setState({ showRestart: true })
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, open } = this.state
    const { match } = this.props

    const buttons = showRestart ? (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' style={{ marginRight: 16 }} onClick={this.handleClose} />
        <RaisedButton label='Restart' primary onClick={() => ipcRenderer.send(WB_RELAUNCH_APP, { })} />
      </div>
    ) : (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' primary onClick={this.handleClose} />
      </div>
    )

    const currentTab = match.params.tab || 'general'
    const tabHeadings = [
      ['General', 'general'],
      ['Accounts', 'accounts'],
      ['Wavebox', 'pro'],
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
            <AccountSettings showRestart={this.handleShowRestart} mailboxId={match.params.tabArg} />
          </Tab>
          <Tab label='Wavebox' value='pro'>
            <ProSettings showRestart={this.handleShowRestart} />
          </Tab>
          <Tab label='Advanced' value='advanced'>
            <AdvancedSettings showRestart={this.handleShowRestart} />
          </Tab>
        </Tabs>
      </Dialog>
    )
  }
}
