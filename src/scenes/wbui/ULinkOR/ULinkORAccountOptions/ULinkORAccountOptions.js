import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { TextField, InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import CancelIcon from '@material-ui/icons/Cancel'
import grey from '@material-ui/core/colors/grey'
import ULinkORAccountResultList from './ULinkORAccountResultList'

const styles = {
  searchCancelIcon: {
    color: grey[400],
    cursor: 'pointer',
    height: '100%'
  }
}

@withStyles(styles)
class ULinkORAccountOptions extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    targetUrl: PropTypes.string.isRequired,
    accountStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired,
    onActive: PropTypes.func,
    onInactive: PropTypes.func,
    onOpenInService: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.inputFieldBlurTO = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillUnmount () {
    clearTimeout(this.inputFieldBlurTO)
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
    clearTimeout(this.inputFieldBlurTO)

    const value = evt.target.value
    this.setState({ searchTerm: value })

    if (value) {
      if (this.props.onActive) {
        this.props.onActive()
      }
    } else {
      this.handleSearchBlur(evt)
    }
  }

  /**
  * Handles the search input bluring
  * @param evt: the event that fired
  */
  handleSearchBlur = (evt) => {
    clearTimeout(this.inputFieldBlurTO)

    this.inputFieldBlurTO = setTimeout(() => {
      if (this.props.onInactive) {
        this.props.onInactive()
      }
    }, 300)
  }

  /**
  * Handles the search element being clicked
  * @param evt: the event that fired
  */
  handleSearchClick = (evt) => {
    clearTimeout(this.inputFieldBlurTO)

    if (this.state.searchTerm) {
      if (this.props.onActive) {
        this.props.onActive()
      }
    }
  }

  /**
  * Handles the search clear button being clicked
  * @param evt: the event that fired
  */
  handleSearchClearClick = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    clearTimeout(this.inputFieldBlurTO)

    if (this.props.onInactive) {
      this.props.onInactive()
      this.inputFieldBlurTO = setTimeout(() => {
        this.setState({ searchTerm: '' })
      }, 300)
    } else {
      this.setState({ searchTerm: '' })
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
      targetUrl,
      onActive,
      onInactive,
      classes,
      searchServices,
      accountStore,
      avatarResolver,
      onOpenInService,
      ...passProps
    } = this.props
    const { searchTerm } = this.state

    return (
      <div {...passProps}>
        <TextField
          value={searchTerm}
          onChange={this.handleSearchTermChange}
          onBlur={this.handleSearchBlur}
          onClick={this.handleSearchClick}
          label='Open in one of your accounts...'
          margin='dense'
          variant='outlined'
          autoFocus
          fullWidth
          placeholder='Search'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && searchTerm.length ? (
              <InputAdornment position='end' className={classes.searchCancelIcon} onClick={this.handleSearchClearClick}>
                <CancelIcon />
              </InputAdornment>
            ) : undefined
          }}
        />
        <ULinkORAccountResultList
          targetUrl={targetUrl}
          searchTerm={searchTerm}
          accountStore={accountStore}
          avatarResolver={avatarResolver}
          onOpenInService={onOpenInService} />
      </div>
    )
  }
}

export default ULinkORAccountOptions
