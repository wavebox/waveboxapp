import React from 'react'
import { RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView, FullscreenModal } from 'Components'
import { userStore } from 'stores/user'
import { mailboxStore } from 'stores/mailbox'
import { WaveboxHTTP } from 'Server'
import Spinner from 'sharedui/Components/Activity/Spinner'
import * as Colors from 'material-ui/styles/colors'

const styles = {
  modalActions: {
    position: 'absolute',
    height: 52,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2
  },
  modalBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 52,
    backgroundColor: 'rgb(255, 255, 255)',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
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

export default class MailboxWizardAddScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
    mailboxStore.listen(this.mailboxChanged)

    // Hopefully fixes an issue where the webview fails to render any content https://github.com/electron/electron/issues/8505
    setTimeout(() => { this.setState({ renderWebview: true }) }, 100)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
    mailboxStore.unlisten(this.mailboxChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()
    return {
      open: true,
      renderWebview: false,
      isLoading: true,
      url: WaveboxHTTP.addMailboxUrl(
        userState.clientId,
        userState.clientToken,
        userState.user.accountTypes,
        mailboxState.mailboxCount() >= userState.user.accountLimit,
        userState.user.accountLimit)
    }
  })()

  userChanged = (userState) => {
    const mailboxState = mailboxStore.getState()
    this.setState({
      url: WaveboxHTTP.addMailboxUrl(
        userState.clientId,
        userState.clientToken,
        userState.user.accountTypes,
        mailboxState.mailboxCount() >= userState.user.accountLimit,
        userState.user.accountLimit)
    })
  }

  mailboxChanged = (mailboxState) => {
    const userState = userStore.getState()
    this.setState({
      url: WaveboxHTTP.addMailboxUrl(
        userState.clientId,
        userState.clientToken,
        userState.user.accountTypes,
        mailboxState.mailboxCount() >= userState.user.accountLimit,
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
    const {
      open,
      isLoading,
      renderWebview,
      url
    } = this.state

    const actions = (
      <div>
        <RaisedButton label='Cancel' onClick={this.handleClose} />
      </div>
    )

    return (
      <FullscreenModal
        modal={false}
        actionsContainerStyle={styles.modalActions}
        bodyStyle={styles.modalBody}
        actions={actions}
        open={open}
        onRequestClose={this.handleClose}>
        {isLoading ? (
          <div style={styles.loadingCover}>
            <Spinner size={50} color={Colors.lightBlue600} speed={0.75} />
            <p>Fetching all the latest Apps</p>
          </div>
        ) : undefined}
        {renderWebview ? (
          <WaveboxWebView
            didStartLoading={() => this.setState({ isLoading: true })}
            didStopLoading={() => this.setState({ isLoading: false })}
            src={url} />
        ) : undefined}
      </FullscreenModal>
    )
  }
}
