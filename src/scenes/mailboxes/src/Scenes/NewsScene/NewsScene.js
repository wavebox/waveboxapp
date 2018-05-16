import React from 'react'
import { RaisedButton } from 'material-ui' //TODO
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView, FullscreenModal } from 'Components'
import { NEWS_URL } from 'shared/constants'
import { settingsActions } from 'stores/settings'
import Spinner from 'sharedui/Components/Activity/Spinner'
import * as Colors from 'material-ui/styles/colors' //TODO

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

export default class NewsScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsActions.openAndMarkNews.defer()

    // Hopefully fixes an issue where the webview fails to render any content https://github.com/electron/electron/issues/8505
    setTimeout(() => { this.setState({ renderWebview: true }) }, 100)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true,
    renderWebview: false,
    isLoading: true
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
      renderWebview,
      isLoading
    } = this.state

    return (
      <FullscreenModal
        modal={false}
        actionsContainerStyle={styles.modalActions}
        bodyStyle={styles.modalBody}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        onRequestClose={this.handleClose}>
        {isLoading ? (
          <div style={styles.loadingCover}>
            <Spinner size={50} color={Colors.lightBlue600} speed={0.75} />
          </div>
        ) : undefined}
        {renderWebview ? (
          <WaveboxWebView
            didStartLoading={() => this.setState({ isLoading: true })}
            didStopLoading={() => this.setState({ isLoading: false })}
            saltClientInfoInUrl={false}
            src={NEWS_URL} />
        ) : undefined}
      </FullscreenModal>
    )
  }
}
