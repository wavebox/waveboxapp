import React from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import { localHistoryStore, localHistoryActions } from 'stores/localHistory'
import ErrorBoundary from 'wbui/ErrorBoundary'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'
import DownloadList from 'wbui/DownloadList'

const styles = {
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  }
}

@withStyles(styles)
class DownloadScene extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rootRef = React.createRef()
  }

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
  // Public
  /* **************************************************************************/

  /**
  * Resets the navigation stack
  */
  resetNavigationStack = () => {
    if (this.rootRef.current) {
      ReactDOM.findDOMNode(this.rootRef.current).scrollTop = 0
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      className,
      ...passProps
    } = this.props
    const {
      downloads
    } = this.state

    return (
      <div
        className={classNames(className, classes.main)}
        ref={this.rootRef}
        {...passProps}>
        <ErrorBoundary>
          <DownloadList
            downloads={downloads}
            onClearAllDownloads={() => localHistoryActions.clearAllDownloads()}
            onClearDownload={(id) => localHistoryActions.deleteDownload(id)}
            onCancelDownload={(id) => localHistoryActions.cancelActiveDownload(id)}
            onOpenContainingFolder={(id) => localHistoryActions.showDownloadInFolder(id)} />
        </ErrorBoundary>
      </div>
    )
  }
}

export default DownloadScene
