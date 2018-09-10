import PropTypes from 'prop-types'
import React from 'react'
import { Paper, TextField, IconButton } from '@material-ui/core'
import { accountStore, accountActions } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import { WB_WINDOW_FIND_START } from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import grey from '@material-ui/core/colors/grey'
import CloseIcon from '@material-ui/icons/Close'
import SearchIcon from '@material-ui/icons/Search'

const SEARCH_HEIGHT = 48
const styles = {
  container: {
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
class ServiceSearch extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.inputRef = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    ipcRenderer.on(WB_WINDOW_FIND_START, this.handleIPCSearchStart)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    ipcRenderer.removeListener(WB_WINDOW_FIND_START, this.handleIPCSearchStart)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceId !== nextProps.serviceId) {
      this.setState(this.generateState(nextProps))
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = this.generateState(this.props)

  /**
  * Generates the state from the given props
  * @param props: the props to use
  * @return state object
  */
  generateState ({ mailboxId, serviceId }) {
    const accountState = accountStore.getState()
    return {
      isActive: accountState.activeServiceId() === serviceId,
      isSearching: accountState.isSearchingService(serviceId),
      searchTerm: accountState.serviceSearchTerm(serviceId)
    }
  }

  accountChanged = (accountState) => {
    const { serviceId } = this.props
    this.setState({
      isActive: accountState.activeServiceId() === serviceId,
      isSearching: accountState.isSearchingService(serviceId),
      searchTerm: accountState.serviceSearchTerm(serviceId)
    })
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the input string changing
  */
  handleChange = (evt) => {
    accountActions.setServiceSearchTerm(this.props.serviceId, evt.target.value)
  }

  /**
  * Handles the find next command
  */
  handleFindNext = () => {
    accountActions.searchServiceNextTerm(this.props.serviceId)
  }

  /**
  * Handles the search stopping
  */
  handleStopSearch = () => {
    accountActions.stopSearchingService(this.props.serviceId)
  }

  /**
  * Handles a key being pressed
  * @param evt: the event that fired
  */
  handleKeyPress = (evt) => {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      this.handleFindNext()
    } else if (evt.keyCode === 27) {
      evt.preventDefault()
      this.handleStopSearch()
    }
  }

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  handleIPCSearchStart = () => {
    if (this.state.isActive) {
      this.inputRef.focus()
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isActive) {
      if (this.state.isSearching !== prevState.isSearching) {
        if (this.state.isSearching) {
          this.inputRef.focus()
        }
      }
    }
  }

  render () {
    const { className, classes, mailboxId, serviceId, ...passProps } = this.props
    const { isSearching, searchTerm } = this.state

    // Use tabIndex to prevent focusing with tab§
    return (
      <Paper
        {...passProps}
        className={classNames(
          classes.container,
          isSearching ? 'active' : undefined
        )}>
        <TextField
          inputRef={(n) => { this.inputRef = n }}
          tabIndex={-1}
          inputProps={{ tabIndex: -1 }}
          placeholder='Search'
          className={classes.input}
          value={searchTerm}
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

export default ServiceSearch
