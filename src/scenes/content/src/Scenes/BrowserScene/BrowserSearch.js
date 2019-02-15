import React from 'react'
import { Paper, TextField, IconButton } from '@material-ui/core'
import { browserActions, browserStore } from 'stores/browser'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close'
import { WB_WINDOW_FIND_START } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import grey from '@material-ui/core/colors/grey'

const SEARCH_HEIGHT = 48
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    bottom: -SEARCH_HEIGHT - 5,
    left: 0,
    minWidth: 300,
    height: SEARCH_HEIGHT,
    backgroundColor: 'white',
    transition: 'none !important',
    zIndex: 10,
    overflow: 'hidden',

    '&.active': {
      bottom: 0
    }
  },
  icon: {
    bottom: -7,
    color: grey[600],
    zIndex: 1
  },
  input: {
    marginLeft: 15,
    width: 200
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

  /**
  * Handles the input bluring
  * @param evt: the event that fired
  */
  handleBlur = (evt) => {
    if (window.location.hash.indexOf('keyboardtarget?search=true') !== -1) {
      window.location.hash = '/'
    }
  }

  /**
  * Handles the input focusing
  * @param evt: the event that fired
  */
  handleFocus = (evt) => {
    window.location.hash = '/keyboardtarget?search=true'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isSearching !== prevState.isSearching) {
      if (this.state.isSearching) {
        this.searchInputRef.focus()
      } else {
        this.searchInputRef.blur()
      }
    }
  }

  render () {
    const { className, classes, ...passProps } = this.props
    const { isSearching, searchTerm } = this.state

    return (
      <Paper {...passProps} className={classNames(classes.container, isSearching ? 'active' : undefined, className)}>
        <TextField
          inputRef={(n) => { this.searchInputRef = n }}
          placeholder='Search'
          tabIndex={-1}
          inputProps={{ tabIndex: -1 }}
          className={classes.input}
          value={searchTerm}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyPress} />
        <IconButton tabIndex={-1} onClick={this.handleFindNext}>
          <SearchIcon className={classes.icon} />
        </IconButton>
        <IconButton tabIndex={-1} onClick={this.handleStopSearch}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      </Paper>
    )
  }
}

export default BrowserSearch
