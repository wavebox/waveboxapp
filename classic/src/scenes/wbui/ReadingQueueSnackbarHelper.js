import React from 'react'
import { Snackbar, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { ipcRenderer } from 'electron'
import {
  WB_READING_QUEUE_LINK_ADDED,
  WB_READING_QUEUE_CURRENT_PAGE_ADDED,
  WB_READING_QUEUE_OPEN_URL,
  WB_READING_QUEUE_OPEN_URL_EMPTY
} from 'shared/ipcEvents'

class ReadingQueueSnackbarHelper extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_READING_QUEUE_LINK_ADDED, this.handleLinkAdded)
    ipcRenderer.on(WB_READING_QUEUE_CURRENT_PAGE_ADDED, this.handleCurrentPageAdded)
    ipcRenderer.on(WB_READING_QUEUE_OPEN_URL, this.handleUrlOpened)
    ipcRenderer.on(WB_READING_QUEUE_OPEN_URL_EMPTY, this.handleUrlFailedOpenEmpty)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_READING_QUEUE_LINK_ADDED, this.handleLinkAdded)
    ipcRenderer.removeListener(WB_READING_QUEUE_CURRENT_PAGE_ADDED, this.handleCurrentPageAdded)
    ipcRenderer.removeListener(WB_READING_QUEUE_OPEN_URL, this.handleUrlOpened)
    ipcRenderer.removeListener(WB_READING_QUEUE_OPEN_URL_EMPTY, this.handleUrlFailedOpenEmpty)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: false,
    message: ''
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleLinkAdded = (evt) => {
    this.setState({
      open: true,
      message: 'Added link to your Tasks'
    })
  }

  handleCurrentPageAdded = (evt) => {
    this.setState({
      open: true,
      message: 'Added current page to your Tasks'
    })
  }

  handleUrlOpened = (evt, readingItem) => {
    this.setState({
      open: true,
      message: [
        'Opening',
        readingItem.title
          ? `"${readingItem.title}"`
          : 'item',
        'from your Tasks'
      ].join(' ')
    })
  }

  handleUrlFailedOpenEmpty = (evt) => {
    this.setState({
      open: true,
      message: 'No more items in your Tasks'
    })
  }

  handleDismiss = () => {
    this.setState({ open: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, message } = this.state

    return (
      <Snackbar
        autoHideDuration={2500}
        disableWindowBlurListener
        key={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open}
        onClose={this.handleDismiss}
        action={(
          <Button color='secondary' size='small' onClick={this.handleDismiss}>
            Okay
          </Button>
        )}
        message={message}
      />
    )
  }
}

export default ReadingQueueSnackbarHelper
