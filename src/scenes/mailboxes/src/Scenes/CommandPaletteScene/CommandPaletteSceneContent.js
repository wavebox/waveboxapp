import React from 'react'
import ReactDOM from 'react-dom'
import { DialogContent, List } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import grey from '@material-ui/core/colors/grey'
import CommandPaletteSearchEngine from './CommandPaletteSearchEngine'
import { accountStore, accountActions } from 'stores/account'
import CommandPaletteSearchItemMailbox from './CommandPaletteSearchItemMailbox'
import CommandPaletteSearchItemService from './CommandPaletteSearchItemService'
import StyleMixins from 'wbui/Styles/StyleMixins'

const SEARCH_SIZE = 58
const SEARCH_ICON_SIZE = 32

const styles = {
  dialogContent: {
    padding: '0px !important'
  },
  searchContainer: {
    minWidth: 600,
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

    '&::placeholder': {
      fontWeight: '200',
      color: grey[500]
    }
  },
  searchResults: {
    height: 300,
    overflowY: 'auto',
    scrollBehavior: 'smooth',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
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
      searchResults: []
    }
  })()

  accountsChanged = (accountState) => {
    this.search.reloadAccounts()
  }

  resultsUpdated = (evt, results) => {
    this.setState({ searchResults: results })
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
  * Handles the key down event in the search input
  * @param evt: the event that fired
  */
  handleSearchInputKeydown = (evt) => {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      evt.stopPropagation()
      const result = this.state.searchResults[0]
      if (result) {
        this.handleOpenSearchResult(evt, result.item.target, result.item.id)
      }
    } else if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault()
      evt.stopPropagation()
      const resultsEl = ReactDOM.findDOMNode(this.searchResultsRef.current)
      if (resultsEl) {
        const targetEl = resultsEl.children[evt.keyCode === 38 ? resultsEl.children.length - 1 : 0]
        if (targetEl) {
          targetEl.focus()
        }
      }
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
      const next = evt.keyCode === 38 ? evt.target.previousElementSibling : evt.target.nextElementSibling
      if (next) {
        next.focus()
      }
    } else if (evt.keyCode !== 13 && evt.keyCode !== 9) { // No control keys
      const inputEl = ReactDOM.findDOMNode(this.searchInputRef.current)
      if (inputEl) {
        inputEl.focus()
      }
    }
  }

  /**
  * Handles opening a search result
  * @param evt: the event that fired
  * @param target: the open target
  * @param id: the id to open
  */
  handleOpenSearchResult = (evt, target, id) => {
    if (target === CommandPaletteSearchEngine.SEARCH_TARGETS.MAILBOX) {
      accountActions.changeActiveMailbox(id)
    } else if (target === CommandPaletteSearchEngine.SEARCH_TARGETS.SERVICE) {
      accountActions.changeActiveService(id)
    }
    window.location.hash = '/'
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
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
  * @return jsx
  */
  renderSearchResultItem (result) {
    const { item } = result
    const key = `${item.target}:${item.id}`
    if (item.target === CommandPaletteSearchEngine.SEARCH_TARGETS.MAILBOX) {
      return (
        <CommandPaletteSearchItemMailbox
          key={key}
          mailboxId={item.id}
          onKeyDown={this.handleSearchResultKeydown}
          onOpenItem={this.handleOpenSearchResult} />
      )
    } else if (item.target === CommandPaletteSearchEngine.SEARCH_TARGETS.SERVICE) {
      return (
        <CommandPaletteSearchItemService
          key={key}
          serviceId={item.id}
          onKeyDown={this.handleSearchResultKeydown}
          onOpenItem={this.handleOpenSearchResult} />
      )
    } else {
      return undefined
    }
  }

  render () {
    const { classes } = this.props
    const {
      searchTerm,
      searchResults
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
          <List className={classes.searchResults} ref={this.searchResultsRef}>
            {searchResults.map((res) => this.renderSearchResultItem(res))}
          </List>
        </DialogContent>
      </React.Fragment>
    )
  }
}

export default CommandPaletteSceneContent
