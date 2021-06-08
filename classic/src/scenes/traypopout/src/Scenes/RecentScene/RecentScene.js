import React from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import Infinate from 'react-infinite'
import { List } from '@material-ui/core'
import ErrorBoundary from 'wbui/ErrorBoundary'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'
import RecentListItem from './RecentListItem'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const LIST_ITEM_HEIGHT = 67

const styles = {
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  list: {
    padding: 0
  },
  listItem: {
    height: LIST_ITEM_HEIGHT
  }
}

@withStyles(styles)
class RecentScene extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rootRef = React.createRef()
    this.listRef = React.createRef()
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)

    window.addEventListener('resize', this.saveContainerHeight, false)
    this.saveContainerHeight()
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)

    window.removeEventListener('resize', this.saveContainerHeight)
  }

  componentDidUpdate () {
    this.saveContainerHeight()
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      recent: accountState.allRecentItems(),
      containerHeight: 0
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      recent: accountState.allRecentItems()
    })
  }

  /* **************************************************************************/
  // UI Lifecycle
  /* **************************************************************************/

  saveContainerHeight = () => {
    if (this.rootRef.current) {
      const height = this.rootRef.current.clientHeight
      if (height !== this.state.containerHeight) { // Don't queue in a callback, this is good enough
        this.setState({ containerHeight: height })
      }
    }
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * Resets the navigation stack
  */
  resetNavigationStack = () => {
    if (this.listRef.current) {
      ReactDOM.findDOMNode(this.listRef.current).scrollTop = 0
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleRecentItemClick = (evt, recentItem) => {
    WBRPCRenderer.wavebox.openRecentLink(recentItem.serviceId, recentItem)
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
      recent,
      containerHeight
    } = this.state

    return (
      <div ref={this.rootRef} className={classNames(className, classes.main)} {...passProps}>
        <ErrorBoundary>
          <List
            className={classes.list}
            onContextMenu={this.handleOpenContextMenu}>
            {containerHeight === 0 ? undefined : (
              <Infinate ref={this.listRef} containerHeight={containerHeight} elementHeight={LIST_ITEM_HEIGHT}>
                {recent.map((recentItem) => {
                  return (
                    <RecentListItem
                      key={recentItem.id}
                      onClick={this.handleRecentItemClick}
                      className={classes.listItem}
                      recentItem={recentItem} />
                  )
                })}
              </Infinate>
            )}
          </List>
        </ErrorBoundary>
      </div>
    )
  }
}

export default RecentScene
