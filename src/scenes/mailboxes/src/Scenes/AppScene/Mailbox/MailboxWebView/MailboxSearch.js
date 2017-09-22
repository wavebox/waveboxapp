import PropTypes from 'prop-types'
import React from 'react'
import { Paper, TextField, IconButton } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import { mailboxStore, mailboxActions } from 'stores/mailbox'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_WINDOW_FIND_START
} from 'shared/ipcEvents'
import { ipcRenderer } from 'electron'

const TEXT_FIELD_REF = 'textfield'

export default class MailboxSearch extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    ipcRenderer.on(WB_WINDOW_FIND_START, this.handleIPCSearchStart)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
    ipcRenderer.removeListener(WB_WINDOW_FIND_START, this.handleIPCSearchStart)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.serviceType !== nextProps.serviceType) {
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
  generateState ({ mailboxId, serviceType }) {
    const mailboxState = mailboxStore.getState()
    return {
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isSearching: mailboxState.isSearchingMailbox(mailboxId, serviceType),
      searchTerm: mailboxState.mailboxSearchTerm(mailboxId, serviceType)
    }
  }

  mailboxesChanged = (mailboxState) => {
    const { mailboxId, serviceType } = this.props
    this.setState({
      isActive: mailboxState.isActive(mailboxId, serviceType),
      isSearching: mailboxState.isSearchingMailbox(mailboxId, serviceType),
      searchTerm: mailboxState.mailboxSearchTerm(mailboxId, serviceType)
    })
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the input string changing
  */
  handleChange = (evt) => {
    mailboxActions.setSearchTerm(this.props.mailboxId, this.props.serviceType, evt.target.value)
  }

  /**
  * Handles the find next command
  */
  handleFindNext = () => {
    mailboxActions.searchNextTerm(this.props.mailboxId, this.props.serviceType)
  }

  /**
  * Handles the search stopping
  */
  handleStopSearch = () => {
    mailboxActions.stopSearchingMailbox(this.props.mailboxId, this.props.serviceType)
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
      this.refs[TEXT_FIELD_REF].focus()
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
          this.refs[TEXT_FIELD_REF].focus()
        }
      }
    }
  }

  render () {
    const { className, ...passProps } = this.props
    delete passProps.mailboxId
    delete passProps.serviceType
    const { isSearching, searchTerm } = this.state

    const composedClassName = [
      'ReactComponent-MailboxSearch',
      isSearching ? 'active' : undefined
    ].concat(className).filter((c) => !!c).join(' ')

    // Use tabIndex to prevent focusing with tab§
    return (
      <Paper {...passProps} className={composedClassName}>
        <TextField
          ref={TEXT_FIELD_REF}
          tabIndex={-1}
          hintText='Search'
          style={{ marginLeft: 15 }}
          inputStyle={{ width: 200 }}
          value={searchTerm}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyPress} />
        <IconButton
          tabIndex={-1}
          iconClassName='material-icons'
          style={{ bottom: -7 }}
          iconStyle={{ color: Colors.grey600 }}
          onClick={this.handleFindNext}>
          search
        </IconButton>
        <IconButton
          tabIndex={-1}
          iconClassName='material-icons'
          style={{ bottom: -7, zIndex: 1 }}
          iconStyle={{ color: Colors.grey600 }}
          onClick={this.handleStopSearch}>
          close
        </IconButton>
      </Paper>
    )
  }
}
