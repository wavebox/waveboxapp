import React from 'react'
import { Paper, TextField, IconButton } from '@material-ui/core'
import { browserActions, browserStore } from 'stores/browser'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close'
import { WB_WINDOW_FIND_START } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

const styles = {
  search: {
    position: 'absolute',
    bottom: -48,
    left: 0,
    minWidth: 300,
    height: 48,
    backgroundColor: 'white',
    transition: 'none !important',
    zIndex: 10,
    overflow: 'hidden'
  },
  searchActive: {
    bottom: 0
  },
  searchField: {
    marginLeft: 15,
    width: 300
  }
}

@withStyles(styles)
class BrowserSearch extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.searchInputRef = undefined
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)
    ipcRenderer.on(WB_WINDOW_FIND_START, this.focus)
  }

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
    ipcRenderer.removeListener(WB_WINDOW_FIND_START, this.focus)
  }

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  state = (() => {
    const browserState = browserStore.getState()
    return {
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm
    }
  })()

  browserUpdated = (browserState) => {
    this.setState({
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm
    })
  }

  /* **************************************************************************/
  // Actions
  /* **************************************************************************/

  /**
  * Focuses the textfield
  */
  focus = () => { this.searchInputRef.focus() }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the input string changing
  * @param evt: the event that fired
  */
  handleChange = (evt) => {
    browserActions.setSearch(evt.target.value)
  }

  /**
  * Handles the find next command
  */
  handleFindNext = () => {
    browserActions.searchNext()
  }

  /**
  * Handles the search stopping
  */
  handleStopSearch = () => {
    browserActions.stopSearch()
  }

  /**
  * Handles a key being pressed
  * @param evt: the event that fired
  */
  handleKeyPress = (evt) => {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      browserActions.searchNext()
    } else if (evt.keyCode === 27) {
      evt.preventDefault()
      browserActions.stopSearch()
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isSearching !== prevState.isSearching) {
      if (this.state.isSearching) {
        this.focus()
      }
    }
  }

  render () {
    const { className, classes, ...passProps } = this.props
    const { isSearching, searchTerm } = this.state

    return (
      <Paper {...passProps} className={classNames(classes.search, isSearching ? classes.searchActive : undefined, className)}>
        <TextField
          inputRef={(n) => { this.searchInputRef = n }}
          placeholder='Search'
          tabIndex={-1}
          inputProps={{ tabIndex: -1 }}
          className={classes.searchField}
          value={searchTerm}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyPress} />
        <IconButton tabIndex={-1} onClick={this.handleFindNext}>
          <SearchIcon />
        </IconButton>
        <IconButton tabIndex={-1} onClick={this.handleStopSearch}>
          <CloseIcon />
        </IconButton>
      </Paper>
    )
  }
}

export default BrowserSearch
