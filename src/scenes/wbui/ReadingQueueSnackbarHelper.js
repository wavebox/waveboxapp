import React from 'react'
import { Snackbar, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { ipcRenderer } from 'electron'
import { WB_READING_QUEUE_ADDED } from 'shared/ipcEvents'

class ReadingQueueSnackbarHelper extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_READING_QUEUE_ADDED, this.handleAddedToReadingQueue)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_READING_QUEUE_ADDED, this.handleAddedToReadingQueue)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: false,
    isCurrentPage: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleAddedToReadingQueue = (evt, link, isCurrentPage) => {
    this.setState({
      open: true,
      isCurrentPage: isCurrentPage
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
    const { open, isCurrentPage } = this.state

    return (
      <Snackbar
        autoHideDuration={2500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={open}
        onClose={this.handleDismiss}
        action={(
          <Button color='secondary' size='small' onClick={this.handleDismiss}>
            Okay
          </Button>
        )}
        message={isCurrentPage ? (
          'Added current page to your Tasks'
        ) : (
          'Added link to your Tasks'
        )}
      />
    )
  }
}

export default ReadingQueueSnackbarHelper
