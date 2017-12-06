import React from 'react'
import { RaisedButton, CircularProgress } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView, FullscreenModal } from 'Components'
import { userStore } from 'stores/user'
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
    backgroundColor: 'rgb(242, 242, 242)',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  }
}

export default class MailboxWizardAddScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      isLoading: false,
      clientId: userStore.getState().clientId
    }
  })()

  userChanged = (userState) => {
    this.setState({
      clientId: userStore.getState().clientId
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
      clientId
    } = this.state
    const url = `https://waveboxio.com/client/${clientId}/add_new`

    const actions = (
      <div>
        {isLoading ? (
          <CircularProgress
            size={18}
            thickness={2}
            color={Colors.cyan600}
            style={{ margin: 10, float: 'left' }} />
        ) : undefined}
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
        <WaveboxWebView
          didStartLoading={() => this.setState({ isLoading: true })}
          didStopLoading={() => this.setState({ isLoading: false })}
          src={url} />
      </FullscreenModal>
    )
  }
}
