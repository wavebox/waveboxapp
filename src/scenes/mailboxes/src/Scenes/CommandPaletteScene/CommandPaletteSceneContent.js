import React from 'react'
import { Button, DialogContent, DialogActions } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search'
import grey from '@material-ui/core/colors/grey'
import CommandPaletteSearch from './CommandPaletteSearch'

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
    height: 300
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
    this.search = new CommandPaletteSearch()
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    window.addEventListener('blur', this.handleClose)
  }

  componentWillUnmount () {
    window.removeEventListener('blur', this.handleClose)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      searchTerm: ''
    }
  })()

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
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { searchTerm } = this.state

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
              onChange={this.handleSearchTermChange} />
          </div>
          <div className={classes.searchResults}>
          </div>
        </DialogContent>
        {/*<DialogActions className={classes.dialogActions}>
          <Button variant='contained' color='primary' onClick={this.handleClose}>
            Close
          </Button>
    </DialogActions>*/}
      </React.Fragment>
    )
  }
}

export default CommandPaletteSceneContent
