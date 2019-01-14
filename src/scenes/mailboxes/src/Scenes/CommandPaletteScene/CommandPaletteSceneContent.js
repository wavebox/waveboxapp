import React from 'react'
import ReactDOM from 'react-dom'
import { DialogContent, List, ListSubheader } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import grey from '@material-ui/core/colors/grey'
import CommandPaletteSearchEngine from './CommandPaletteSearchEngine'
import { accountStore } from 'stores/account'
import CommandPaletteSearchItemService from './CommandPaletteSearchItemService'
import CommandPaletteSearchItemServiceSub from './CommandPaletteSearchItemServiceSub'
import StyleMixins from 'wbui/Styles/StyleMixins'

const TOP_HITS_COUNT = 5
const SEARCH_SIZE = 58
const SEARCH_ICON_SIZE = 32

const HUMANIZED_SEARCH_TARGETS = {
  [CommandPaletteSearchEngine.SEARCH_TARGETS.SERVICE]: 'Services',
  [CommandPaletteSearchEngine.SEARCH_TARGETS.BOOKMARK]: 'Pinned',
  [CommandPaletteSearchEngine.SEARCH_TARGETS.RECENT]: 'Recent',
  [CommandPaletteSearchEngine.SEARCH_TARGETS.READING_QUEUE]: 'Tasks'
}

const styles = {
  dialogContent: {
    padding: '0px !important',
    height: '100%',
    overflow: 'hidden'
  },
  searchContainer: {
    height: SEARCH_SIZE,
    position: 'relative',
    borderBottom: `1px solid ${grey[300]}`
  },
  searchIcon: {
    position: 'absolute',
    top: (SEARCH_SIZE - SEARCH_ICON_SIZE) / 2,
    left: (SEARCH_SIZE - SEARCH_ICON_SIZE) / 2,
    width: SEARCH_ICON_SIZE,
    height: SEARCH_ICON_SIZE,
    color: grey[700]
  },
  searchInput: {
    display: 'block',
    width: '100%',
    height: '100%',
    paddingRight: 16,
    paddingLeft: SEARCH_SIZE,
    fontSize: 26,
    borderRadius: 0,
    border: 'none',
    outline: 'none',
    fontWeight: '300',
    backgroundColor: 'transparent',

    '&::placeholder': {
      fontWeight: '200',
      color: grey[500]
    }
  },
  searchResultSectionHeading: {
    backgroundColor: grey[400],
    lineHeight: '28px',
    textTransform: 'uppercase'
  },
  searchResults: {
    height: `calc(100% - ${SEARCH_SIZE}px)`,
    paddingTop: 0,
    paddingBottom: 0,
    overflowY: 'auto',
    scrollBehavior: 'smooth',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  fullDialogHelper: {
    width: '100%',
    height: `100%`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: grey[600]
  },
  fullDialogHelperIcon: {
    width: 150,
    height: 150
  }
}

@withStyles(styles)
class CommandPaletteSceneContent extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.searchInputRef = React.createRef()
    this.searchResultsRef = React.createRef()
    this.search = new CommandPaletteSearchEngine()
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountsChanged)
    this.search.on('results-updated', this.resultsUpdated)
    window.addEventListener('blur', this.handleClose)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountsChanged)
    this.search.removeListener('results-updated', this.resultsUpdated)
    window.removeEventListener('blur', this.handleClose)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      searchTerm: '',
      searchResults: [],
      searchResultsByTarget: {}
    }
  })()

  accountsChanged = (accountState) => {
    this.search.reloadAccounts()
  }

  resultsUpdated = (evt, results, resultsByTarget) => {
    this.setState({
      searchResults: results,
      searchResultsByTarget: resultsByTarget
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the search term changing
  * @param evt: the event that fired
  */
  handleSearchTermChange = (evt) => {
    this.setState({ searchTerm: evt.target.value })
    this.search.asyncSearch(evt.target.value)
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // UI Events: Keyboard navigation
  /* **************************************************************************/

  /**
  * Handles the key down event in the search input
  * @param evt: the event that fired
  */
  handleSearchInputKeydown = (evt) => {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      evt.stopPropagation()
      const targets = this._getResultTargetElements()
      if (!targets[0]) { return }
      targets[0].click()
    } else if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault()
      evt.stopPropagation()
      this._focusKeyboardNextResult(evt.keyCode)
    }
  }

  /**
  * Handles the keydown event in a result
  * @param evt: the event that fired
  */
  handleSearchResultKeydown = (evt) => {
    if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault()
      evt.stopPropagation()
      this._focusKeyboardNextResult(evt.keyCode, evt.target)
    } else if (evt.keyCode !== 13 && evt.keyCode !== 9) { // No control keys
      const inputEl = ReactDOM.findDOMNode(this.searchInputRef.current)
      if (inputEl) {
        inputEl.focus()
      }
    }
  }

  /**
  * @return the dom search result dom targets
  */
  _getResultTargetElements () {
    const resultsEl = ReactDOM.findDOMNode(this.searchResultsRef.current)
    return resultsEl
      ? Array.from(resultsEl.querySelectorAll(':scope > [role="button"]'))
      : []
  }

  /**
  * Focuses the next result
  * @param keyCode: 38 and 40 keycodes to correct 1 and -1
  * @param current=undefined: the current dom element to move from. If undefined assumed search
  */
  _focusKeyboardNextResult (keyCode, current = undefined) {
    const direction = keyCode === 38 ? -1 : 1
    const targets = this._getResultTargetElements()
    if (!targets.length) { return }

    if (current) {
      const currentIndex = targets.findIndex((t) => t === current)
      if (currentIndex === -1) { return }
      const target = targets[currentIndex + direction]
      if (!target) { return }
      target.focus()
    } else {
      const target = (direction === 1 ? targets.slice(0, 1) : targets.slice(-1))[0]
      if (!target) { return }
      target.focus()
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders a single search result item
  * @param result: the search item result
  * @param keyPrefix='': an option prefix to give the element key
  * @return jsx
  */
  renderSearchResultItem (result, keyPrefix = '') {
    const { item } = result
    const commonProps = {
      key: `${keyPrefix}${item.target}:${item.id}`,
      onKeyDown: this.handleSearchResultKeydown,
      onRequestClose: this.handleClose
    }

    switch (item.target) {
      case CommandPaletteSearchEngine.SEARCH_TARGETS.SERVICE:
        return (
          <CommandPaletteSearchItemService
            {...commonProps}
            mailboxId={item.parentId}
            serviceId={item.id} />
        )
      case CommandPaletteSearchEngine.SEARCH_TARGETS.BOOKMARK:
      case CommandPaletteSearchEngine.SEARCH_TARGETS.RECENT:
      case CommandPaletteSearchEngine.SEARCH_TARGETS.READING_QUEUE:
        return (
          <CommandPaletteSearchItemServiceSub
            {...commonProps}
            serviceId={item.parentId}
            itemId={item.id}
            searchTarget={item.target} />
        )
    }
  }

  /**
  * Renders the search results
  * @param classes: the classes
  * @param searchTerm: the search term that's in use
  * @param searchResults: the full array of search results
  * @param searchResultsByTarget: the results listed by target
  * @return jsx
  */
  renderSearchResults (classes, searchTerm, searchResults, searchResultsByTarget) {
    if (!searchTerm) {
      return (
        <div className={classes.fullDialogHelper}>
          <SearchIcon className={classes.fullDialogHelperIcon} />
          Type to start searching
        </div>
      )
    }

    if (!searchResults.length) {
      return (
        <div className={classes.fullDialogHelper}>
          <SearchIcon className={classes.fullDialogHelperIcon} />
          No results found
        </div>
      )
    }

    if (searchResults.length <= TOP_HITS_COUNT) {
      return (
        <React.Fragment>
          {searchResults.map((res) => this.renderSearchResultItem(res))}
        </React.Fragment>
      )
    } else {
      const top = searchResults.slice(0, TOP_HITS_COUNT)
      const sections = Object.values(searchResultsByTarget)
        .filter((sec) => sec.items.length !== 0)
        .sort((a, b) => b.score - a.score)

      return (
        <React.Fragment>
          <ListSubheader className={classes.searchResultSectionHeading}>
            Top hits
          </ListSubheader>
          {top.map((res) => this.renderSearchResultItem(res, 'top'))}
          {sections.map(({ target, items }) => {
            return (
              <React.Fragment key={`section-${target}`}>
                <ListSubheader className={classes.searchResultSectionHeading}>
                  {HUMANIZED_SEARCH_TARGETS[target]}
                </ListSubheader>
                {items.map((res) => this.renderSearchResultItem(res))}
              </React.Fragment>
            )
          })}
        </React.Fragment>
      )
    }
  }

  render () {
    const { classes } = this.props
    const {
      searchTerm,
      searchResults,
      searchResultsByTarget
    } = this.state

    return (
      <React.Fragment>
        <DialogContent className={classes.dialogContent}>
          <div className={classes.searchContainer}>
            <SearchIcon className={classes.searchIcon} />
            <input
              type='text'
              ref={this.searchInputRef}
              autoFocus
              className={classes.searchInput}
              placeholder='Type to search...'
              value={searchTerm}
              onKeyDown={this.handleSearchInputKeydown}
              onChange={this.handleSearchTermChange} />
          </div>
          <List
            ref={this.searchResultsRef}
            className={classes.searchResults}
            dense>
            {this.renderSearchResults(classes, searchTerm, searchResults, searchResultsByTarget)}
          </List>
        </DialogContent>
      </React.Fragment>
    )
  }
}

export default CommandPaletteSceneContent
