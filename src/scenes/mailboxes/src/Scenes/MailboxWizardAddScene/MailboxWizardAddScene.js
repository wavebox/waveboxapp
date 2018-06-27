import React from 'react'
import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import { accountStore } from 'stores/account'
import { WaveboxHTTP } from 'Server'
import Spinner from 'wbui/Activity/Spinner'
import lightBlue from '@material-ui/core/colors/lightBlue'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  },
  loadingCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

@withStyles(styles)
class MailboxWizardAddScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
    accountStore.listen(this.accountChanged)

    // Hopefully fixes an issue where the webview fails to render any content https://github.com/electron/electron/issues/8505
    setTimeout(() => { this.setState({ renderWebview: true }) }, 100)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
    accountStore.unlisten(this.accountChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    const accountState = accountStore.getState()
    return {
      open: true,
      renderWebview: false,
      isLoading: true,
      url: WaveboxHTTP.addMailboxUrl(
        userState.clientId,
        userState.clientToken,
        userState.user.classicAccountTypes,
        accountState.serviceCount() >= userState.user.accountLimit,
        userState.user.accountLimit)
    }
  })()

  userChanged = (userState) => {
    const accountState = accountStore.getState()
    this.setState({
      url: WaveboxHTTP.addMailboxUrl(
        userState.clientId,
        userState.clientToken,
        userState.user.classicAccountTypes,
        accountState.serviceCount() >= userState.user.accountLimit,
        userState.user.accountLimit)
    })
  }

  accountChanged = (accountState) => {
    const userState = userStore.getState()
    this.setState({
      url: WaveboxHTTP.addMailboxUrl(
        userState.clientId,
        userState.clientToken,
        userState.user.classicAccountTypes,
        accountState.serviceCount() >= userState.user.accountLimit,
        userState.user.accountLimit)
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

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
    const { classes } = this.props
    const {
      open,
      isLoading,
      renderWebview,
      url
    } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          {isLoading ? (
            <div className={classes.loadingCover}>
              <Spinner size={50} color={lightBlue[600]} speed={0.75} />
              <p>Fetching all the latest Apps</p>
            </div>
          ) : undefined}
          {renderWebview ? (
            <WaveboxWebView
              didStartLoading={() => this.setState({ isLoading: true })}
              didStopLoading={() => this.setState({ isLoading: false })}
              src={url} />
          ) : undefined}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant='raised' onClick={this.handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default MailboxWizardAddScene
