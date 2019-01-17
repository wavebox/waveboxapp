import React from 'react'
import { localHistoryStore, localHistoryActions } from 'stores/localHistory'
import DownloadList from 'wbui/DownloadList'

class DownloadsPopoutContent extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    localHistoryStore.listen(this.historyStoreUpdated)
  }

  componentWillUnmount () {
    localHistoryStore.unlisten(this.historyStoreUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      downloads: localHistoryStore.getState().getDownloadsOrdered(true)
    }
  })()

  historyStoreUpdated = (localHistoryState) => {
    this.setState({
      downloads: localHistoryState.getDownloadsOrdered(true)
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { downloads } = this.state

    return (
      <DownloadList
        downloads={downloads}
        onClearAllDownloads={() => localHistoryActions.clearAllDownloads()}
        onClearDownload={(id) => localHistoryActions.deleteDownload(id)}
        onCancelDownload={(id) => localHistoryActions.cancelActiveDownload(id)}
        onOpenContainingFolder={(id) => localHistoryActions.showDownloadInFolder(id)} />
    )
  }
}

export default DownloadsPopoutContent
