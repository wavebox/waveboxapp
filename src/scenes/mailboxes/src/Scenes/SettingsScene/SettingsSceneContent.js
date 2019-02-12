import PropTypes from 'prop-types'
import React from 'react'
import { DialogContent, DialogActions, Button, Tabs, Tab, AppBar } from '@material-ui/core'
import GeneralSettings from './GeneralSettings'
import ExtensionSettings from './ExtensionSettings'
import AccountSettings from './Accounts/AccountSettings'
import ProSettings from './ProSettings'
import SupportSettings from './SupportSettings'
import shallowCompare from 'react-addons-shallow-compare'
import { WB_RELAUNCH_APP } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'

const styles = {
  // Dialog
  dialogContent: {
    position: 'relative',
    backgroundColor: 'rgb(242, 242, 242)'
  },
  dialogActions: {
    backgroundColor: 'white',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  },

  // Tabs
  appBar: {
    backgroundColor: lightBlue[600]
  },
  tabButton: {
    color: 'white',
    maxWidth: 'none'
  },
  tabInkBar: {
    backgroundColor: lightBlue[100]
  },

  // Footer
  button: {
    marginLeft: 8,
    marginRight: 8
  }
}

@withStyles(styles)
class SettingsSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        tab: PropTypes.string,
        tabArg: PropTypes.string
      }).isRequired
    }).isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    showRestart: false
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Changes the tab
  */
  handleTabChange = (evt, value) => {
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
    window.location.hash = '/'
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

  /**
  * @param classes:
  * @param currentTab: the current tab
  * @param tabArg: any arguments for the tab
  */
  renderTab (classes, currentTab, tabArg) {
    if (currentTab === 'general') {
      return (<GeneralSettings showRestart={this.handleShowRestart} sectionId={tabArg} />)
    } else if (currentTab === 'extensions') {
      return (<ExtensionSettings showRestart={this.handleShowRestart} />)
    } else if (currentTab === 'accounts') {
      return (
        <AccountSettings
          showRestart={this.handleShowRestart}
          mailboxId={(tabArg || '').split(':')[0]}
          serviceId={(tabArg || '').split(':')[1]} />
      )
    } else if (currentTab === 'support') {
      return (<SupportSettings />)
    } else if (currentTab === 'pro') {
      return (<ProSettings showRestart={this.handleShowRestart} />)
    }
  }

  render () {
    const { showRestart } = this.state
    const { classes, match } = this.props

    const tab = match.params.tab || 'general'
    const tabArg = match.params.tabArg

    return (
      <React.Fragment>
        <AppBar position='static' className={classes.appBar}>
          <Tabs
            variant='fullWidth'
            value={tab}
            onChange={this.handleTabChange}
            classes={{ indicator: classes.tabInkBar }}>
            <Tab
              label='General'
              className={classes.tabButton}
              value='general' />
            <Tab
              label='Accounts'
              className={classes.tabButton}
              value='accounts' />
            <Tab
              label='Extensions'
              className={classes.tabButton}
              value='extensions' />
            <Tab
              label='Support'
              className={classes.tabButton}
              value='support' />
            <Tab
              label='Wavebox Subscription'
              className={classes.tabButton}
              value='pro' />
          </Tabs>
        </AppBar>
        <DialogContent className={classes.dialogContent}>
          {this.renderTab(classes, tab, tabArg)}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            variant='contained'
            color={showRestart ? undefined : 'primary'}
            className={classes.button}
            onClick={this.handleClose}>
            Close
          </Button>
          {showRestart ? (
            <Button
              variant='contained'
              color='primary'
              className={classes.button}
              onClick={this.handleRestart}>
              Restart
            </Button>
          ) : undefined}
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default SettingsSceneContent
