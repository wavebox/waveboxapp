import React from 'react'
import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore, userActions } from 'stores/user'
import { accountStore, accountActions } from 'stores/account'
import { WaveboxHTTP } from 'Server'
import Spinner from 'wbui/Activity/Spinner'
import lightBlue from '@material-ui/core/colors/lightBlue'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import electron from 'electron'
import {
  WAVEBOX_CAPTURE_URL_HOSTNAMES,
  WAVEBOX_CAPTURE_URLS
} from 'shared/constants'

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
class AccountWizardAddScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxId: PropTypes.string
      })
    })
  }

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
        accountState.unrestrictedServices().length >= userState.user.accountLimit,
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
        accountState.unrestrictedServices().length >= userState.user.accountLimit,
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
        accountState.unrestrictedServices().length >= userState.user.accountLimit,
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

  /**
  * Opens a new window in the browser
  * @param evt: the event that fired
  */
  handleOpenNewWindow = (evt) => {
    const defaultHandled = WaveboxWebView.routeWaveboxUrl(evt.url)
    if (defaultHandled) { return }
    const mailboxAddHandled = this.processAddAccout(evt.url)
    if (mailboxAddHandled) { return }
    electron.remote.shell.openExternal(evt.url)
  }

  /**
  * Runs the add mailbox process from an add url
  * @param url: the url that was opened
  * @return true if handled or false otherwise
  */
  processAddAccout (url) {
    const match = WAVEBOX_CAPTURE_URL_HOSTNAMES.find((hostname) => {
      return url.startsWith(`https://${hostname}`)
    })
    if (!match) { return false }

    const purl = new URL(url)
    if (purl.pathname !== WAVEBOX_CAPTURE_URLS.ADD_MAILBOX) { return false }

    // Start the add process
    const containerId = purl.searchParams.get('container_id')
    const container = purl.searchParams.get('container')
    const type = purl.searchParams.get('type')
    const accessMode = purl.searchParams.get('access_mode')
    if (containerId && container) {
      userActions.sideloadContainerLocally(containerId, JSON.parse(container))
    }
    if (type) {
      if (this.props.match.params.mailboxId) {
        accountActions.startAttachNewService(this.props.match.params.mailboxId, type, accessMode)
      } else {
        accountActions.startAddMailboxGroup(type, accessMode)
      }
    }
    return true
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
              newWindow={this.handleOpenNewWindow}
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

export default AccountWizardAddScene
