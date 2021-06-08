import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import UnreadMailboxList from './UnreadMailboxList'
import UnreadMailbox from './UnreadMailbox'
import SwipeableViews from 'react-swipeable-views'
import ErrorBoundary from 'wbui/ErrorBoundary'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  tabContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  tab: {
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  }
}

@withStyles(styles)
class UnreadScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.clearDisplayMailboxIdTO = null
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    index: 0,
    displayMailboxId: undefined
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * Resets the navigation stack
  */
  resetNavigationStack = () => {
    clearTimeout(this.clearDisplayMailboxIdTO)
    this.setState({
      index: 0,
      displayMailboxId: undefined
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles showing the mailboxes list
  */
  handleShowMailboxList = () => {
    clearTimeout(this.clearDisplayMailboxIdTO)
    this.clearDisplayMailboxIdTO = setTimeout(() => {
      this.setState({ displayMailboxId: undefined })
    }, 1000)

    this.setState({ index: 0 })
  }

  /**
  * Handles showing the mailbox
  */
  handleShowMailbox = (mailboxId) => {
    clearTimeout(this.clearDisplayMailboxIdTO)
    this.setState({
      displayMailboxId: mailboxId,
      index: 1
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, ...passProps } = this.props
    const { displayMailboxId, index } = this.state

    return (
      <div {...passProps}>
        <ErrorBoundary>
          <SwipeableViews
            containerStyle={styles.tabContainer}
            slideStyle={styles.tab}
            index={index}>
            <UnreadMailboxList requestShowMailbox={this.handleShowMailbox} />
            {displayMailboxId ? (
              <UnreadMailbox
                mailboxId={displayMailboxId}
                requestShowMailboxList={this.handleShowMailboxList} />
            ) : (
              <div />
            )}
          </SwipeableViews>
        </ErrorBoundary>
      </div>
    )
  }
}

export default UnreadScene
