import React from 'react'
import { RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView, FullscreenModal } from 'Components'
import { userStore } from 'stores/user'
import { settingsActions } from 'stores/settings'

const styles = {
  modalActions: {
    position: 'absolute',
    height: 52,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
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
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  }
}

export default class AccountMessageScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      url: userStore.getState().user.accountMessageUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      url: userState.user.accountMessageUrl
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
    settingsActions.setSeenAccountMessageUrl(this.state.url)
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  handleOpenNewWindow = (evt) => {
    // Unhandled urls will be handled by the main thread
    const didRoute = WaveboxWebView.routeWaveboxUrl(evt.url)
    if (didRoute) {
      settingsActions.setSeenAccountMessageUrl(this.state.url)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, url } = this.state

    return (
      <FullscreenModal
        modal={false}
        actionsContainerStyle={styles.modalActions}
        bodyStyle={styles.modalBody}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        onRequestClose={this.handleClose}>
        <WaveboxWebView
          src={url}
          newWindow={this.handleOpenNewWindow} />
      </FullscreenModal>
    )
  }
}
