import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, FlatButton, Tabs, Tab } from 'material-ui'
import GeneralSettings from './GeneralSettings'
import AccountSettings from './Accounts/AccountSettings'
import ProSettings from './ProSettings'
import AdvancedSettings from './AdvancedSettings'
import SupportSettings from './SupportSettings'
import * as Colors from 'material-ui/styles/colors'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsSceneTabTemplate from './SettingsSceneTabTemplate'
import { WB_RELAUNCH_APP } from 'shared/ipcEvents'
import { FullscreenModal } from 'Components'

const { ipcRenderer } = window.nativeRequire('electron')

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
    alignContent: 'stretch'
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
    }, 250)
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
      ['Advanced', 'advanced'],
      ['Support', 'support']
    ]

    return (
      <FullscreenModal
        modal={false}
        actions={buttons}
        open={open}
        bodyStyle={styles.modalBody}
        actionsContainerStyle={styles.modalActions}
        onRequestClose={this.handleClose}>
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
