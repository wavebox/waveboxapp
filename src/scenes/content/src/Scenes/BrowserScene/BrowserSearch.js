const React = require('react')
const { Paper, TextField, IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const { browserActions, browserStore } = require('stores/browser')

const INPUT_REF = 'textField'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'BrowserSearch',

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    browserStore.listen(this.browserUpdated)
  },

  componentWillUnmount () {
    browserStore.unlisten(this.browserUpdated)
  },

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  getInitialState () {
    const browserState = browserStore.getState()
    return {
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm
    }
  },

  browserUpdated (browserState) {
    this.setState({
      isSearching: browserState.isSearching,
      searchTerm: browserState.searchTerm
    })
  },

  /* **************************************************************************/
  // Actions
  /* **************************************************************************/

  /**
  * Focuses the textfield
  */
  focus () { this.refs[INPUT_REF].focus() },

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the input string changing
  * @param evt: the event that fired
  */
  handleChange (evt) {
    browserActions.setSearch(evt.target.value)
  },

  /**
  * Handles the find next command
  */
  handleFindNext () {
    browserActions.searchNext()
  },

  /**
  * Handles the search stopping
  */
  handleStopSearch () {
    browserActions.stopSearch()
  },

  /**
  * Handles a key being pressed
  * @param evt: the event that fired
  */
  handleKeyPress (evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      browserActions.searchNext()
    } else if (evt.keyCode === 27) {
      evt.preventDefault()
      browserActions.stopSearch()
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { className, ...passProps } = this.props
    const { isSearching, searchTerm } = this.state

    const fullClassName = [
      'ReactComponent-BrowserSceneSearch',
      isSearching ? 'active' : undefined,
      className
    ].filter((c) => !!c).join(' ')

    return (
      <Paper {...passProps} className={fullClassName}>
        <TextField
          ref={INPUT_REF}
          hintText='Search'
          style={{ marginLeft: 15 }}
          inputStyle={{ width: 200 }}
          value={searchTerm}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyPress} />
        <IconButton
          iconClassName='material-icons'
          style={{ bottom: -7 }}
          iconStyle={{ color: Colors.grey600 }}
          onClick={this.handleFindNext}>
          search
        </IconButton>
        <IconButton
          iconClassName='material-icons'
          style={{ bottom: -7, zIndex: 1 }}
          iconStyle={{ color: Colors.grey600 }}
          onClick={this.handleStopSearch}>
          close
        </IconButton>
      </Paper>
    )
  }
})
