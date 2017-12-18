import PropTypes from 'prop-types'
import './SettingsScene.less'
import React from 'react'
import { RaisedButton, FlatButton, Tabs, Tab } from 'material-ui'
import GeneralSettings from './GeneralSettings'
import ExtensionSettings from './ExtensionSettings'
import AccountSettings from './Accounts/AccountSettings'
import ProSettings from './ProSettings'
import AdvancedSettings from './AdvancedSettings'
import SupportSettings from './SupportSettings'
import * as Colors from 'material-ui/styles/colors'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsSceneTabTemplate from './SettingsSceneTabTemplate'
import { WB_RELAUNCH_APP } from 'shared/ipcEvents'
import { FullscreenModal } from 'Components'
import { settingsStore } from 'stores/settings'
import { ipcRenderer } from 'electron'

const styles = {
  modalBody: {
    borderRadius: 2,
    padding: 0,
    backgroundColor: 'rgb(242, 242, 242)'
  },
  modalActions: {
    position: 'absolute',
    height: 52,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTop: '1px solid rgb(232, 232, 232)'
  },
  tabToggles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'stretch',
    overflowX: 'auto'
  },
  tabToggle: {
    height: 50,
    borderRadius: 0,
    flex: 1,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid'
  },
  body: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 52,
    overflowY: 'auto',
    padding: 24
  }
}

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
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      open: true,
      showRestart: false,
      showExtensions: settingsState.extension.enableChromeExperimental
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      showExtensions: settingsState.extension.enableChromeExperimental
    })
  }

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
    }, 250)
  }

  /**
  * Restarts the app
  */
  handleRestart = () => {
    // The temptation for the user is sometimes to edit a field and hit restart,
    // but this can leave some waiting ipc events and data that isn't written to
    // disk. Seeing that we don't have a "wait for everything to finish" call at
    // the moment we need to wait a little time. By the way this is really bad,
    // but it's an infrequent event and just fixes it. (@Thomas101) we should
    // look into a better solution to this problem

    // Close the popup so it looks like something is happening
    setTimeout(() => {
      this.handleClose()
    }, 250)

    // Wait and then restart
    setTimeout(() => {
      ipcRenderer.send(WB_RELAUNCH_APP, { })
    }, 1000)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, open, showExtensions } = this.state
    const { match } = this.props

    const buttons = showRestart ? (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' style={{ marginRight: 16 }} onClick={this.handleClose} />
        <RaisedButton label='Restart' primary onClick={this.handleRestart} />
      </div>
    ) : (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' primary onClick={this.handleClose} />
      </div>
    )

    const currentTab = match.params.tab || 'general'
    const tabHeadings = [
      ['General', 'general'],
      showExtensions ? ['Extensions', 'extensions'] : undefined,
      ['Accounts', 'accounts'],
      ['Wavebox', 'pro'],
      ['Advanced', 'advanced'],
      ['Support', 'support']
    ].filter((tab) => !!tab)

    return (
      <FullscreenModal
        modal={false}
        actions={buttons}
        open={open}
        bodyStyle={styles.modalBody}
        actionsContainerStyle={styles.modalActions}
        onRequestClose={this.handleClose}>
        <div style={styles.tabToggles} className='ReactComponent-SettingsScene-Tabs'>
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
        <div style={styles.body} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
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
            {showExtensions ? (
              <Tab label='Extensions' value='extensions'>
                <ExtensionSettings showRestart={this.handleShowRestart} />
              </Tab>
            ) : undefined}
            <Tab label='Accounts' value='accounts'>
              <AccountSettings showRestart={this.handleShowRestart} mailboxId={match.params.tabArg} />
            </Tab>
            <Tab label='Wavebox' value='pro'>
              <ProSettings showRestart={this.handleShowRestart} />
            </Tab>
            <Tab label='Advanced' value='advanced'>
              <AdvancedSettings showRestart={this.handleShowRestart} />
            </Tab>
            <Tab label='Support' value='support'>
              <SupportSettings />
            </Tab>
          </Tabs>
        </div>
      </FullscreenModal>
    )
  }
}
