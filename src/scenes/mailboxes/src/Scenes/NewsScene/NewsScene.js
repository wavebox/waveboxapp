import React from 'react'
import { RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView, FullscreenModal } from 'Components'
import { NEWS_URL } from 'shared/constants'
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

export default class NewsScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsActions.openAndMarkNews.defer()
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true
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
    const { open } = this.state

    return (
      <FullscreenModal
        modal={false}
        actionsContainerStyle={styles.modalActions}
        bodyStyle={styles.modalBody}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        onRequestClose={this.handleClose}>
        <WaveboxWebView
          src={NEWS_URL}
          saltClientInfoInUrl={false} />
      </FullscreenModal>
    )
  }
}
