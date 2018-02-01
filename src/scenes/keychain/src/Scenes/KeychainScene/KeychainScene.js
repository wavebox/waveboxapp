import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import * as Colors from 'material-ui/styles/colors'
import Spinner from 'sharedui/Components/Activity/Spinner'
import KeychainAddDialog from './KeychainAddDialog'
import KeychainStorageInfo from './KeychainStorageInfo'
import {
  RaisedButton,
  Toolbar, ToolbarGroup, ToolbarTitle,
  Table, TableBody, TableRow, TableRowColumn, TableHeader, TableHeaderColumn
} from 'material-ui'
import {
  WB_KEYCHAIN_REQUEST_CREDENTIALS,
  WB_KEYCHAIN_SUPPLY_CREDENTIALS,
  WB_KEYCHAIN_ADD_CREDENTIALS,
  WB_KEYCHAIN_DELETE_CREDENTIALS
} from 'shared/ipcEvents'

const styles = {
  // Title
  title: {
    fontSize: '16px',
    lineHeight: '18px',
    marginBottom: 2,
    display: 'block'
  },
  storageInfo: {
    fontSize: '14px',
    lineHeight: '16px',
    display: 'block'
  },

  // Loading
  loading: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16
  },

  // Toolbar
  toolbar: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8
  },
  toolbarButton: {
    marginRight: 8
  },

  // Table
  noneMessage: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: '14px',
    color: Colors.grey600
  }
}

export default class KeychainScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceName: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    openMode: PropTypes.string
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.requestCredentials(this.props.serviceName, this.props.apiKey)
    ipcRenderer.on(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this.handleCredentialsSupplied)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_KEYCHAIN_SUPPLY_CREDENTIALS, this.handleCredentialsSupplied)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceName !== nextProps.serviceName || this.props.apiKey !== nextProps.apiKey) {
      this.requestCredentials(nextProps.serviceName, nextProps.apiKey)
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      credentials: [],
      selected: [],
      requesting: true,
      addDialogOpen: this.props.openMode === 'add'
    }
  })()

  /**
  * Requests the credentials
  * @param serviceName: the name of the service
  * @param apiKey: the api key
  * @return an array of credentials
  */
  requestCredentials (serviceName, apiKey) {
    this.setState({
      requesting: true,
      credentials: []
    })
    ipcRenderer.send(WB_KEYCHAIN_REQUEST_CREDENTIALS, apiKey, serviceName)
  }

  /**
  * Handles the credentials coming down the wire
  */
  handleCredentialsSupplied = (evt, serviceName, credentials) => {
    if (serviceName === this.props.serviceName) {
      this.setState({
        requesting: false,
        credentials: credentials
      })
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the add dialog
  */
  handleCloseAddDialog = () => {
    this.setState({ addDialogOpen: false })
  }

  /**
  * Opens the add dialog
  */
  handleOpenAddDialog = () => {
    this.setState({ addDialogOpen: true })
  }

  /**
  * Adds a new set of credentials
  * @param account: the account label
  * @param password: the password
  */
  handleAddCredentials = (account, password) => {
    this.setState({
      addDialogOpen: false,
      requesting: true
    })
    const { apiKey, serviceName } = this.props
    ipcRenderer.send(WB_KEYCHAIN_ADD_CREDENTIALS, apiKey, serviceName, account, password)
  }

  /**
  * Deletes the selected credentials
  */
  handleDeleteSelectedCredentials = () => {
    const { apiKey, serviceName } = this.props
    const { selected } = this.state
    this.setState({
      selected: [],
      requesting: true
    })
    ipcRenderer.send(WB_KEYCHAIN_DELETE_CREDENTIALS, apiKey, serviceName, selected)
  }

  /**
  * Handles rows being selected
  * @param selectedRowIndecies: an array of selected rows
  */
  handleRowSelection = (selectedRowIndecies) => {
    const selected = selectedRowIndecies.map((index) => {
      return this.state.credentials[index].account
    })
    this.setState({ selected: selected })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the crednetials table
  * @param serviceName: the name of the service
  * @param credentials: the credentials to render
  * @param selected: an array of selected items
  * @return jsx
  */
  renderCredentialsTable (serviceName, credentials, selected) {
    if (credentials.length) {
      const selectedIndex = new Set(selected)

      return (
        <Table onRowSelection={this.handleRowSelection} multiSelectable>
          <TableHeader displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody deselectOnClickaway={false}>
            {credentials.map((rec) => {
              return (
                <TableRow key={rec.account} selected={selectedIndex.has(rec.account)}>
                  <TableRowColumn>{rec.account}</TableRowColumn>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
    } else {
      return (
        <div style={styles.noneMessage}>
          <div>{`No passwords saved for ${serviceName}`}</div>
          <br />
          <RaisedButton
            onClick={this.handleOpenAddDialog}
            label='Add your first' />
        </div>
      )
    }
  }

  render () {
    const { serviceName, apiKey, openMode, ...passProps } = this.props
    const { requesting, credentials, selected, addDialogOpen } = this.state

    return (
      <div {...passProps}>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle
              text={(
                <span>
                  <span style={styles.title}>
                    <strong>Saved passwords for </strong>
                    <span>{serviceName}</span>
                  </span>
                  <KeychainStorageInfo style={styles.storageInfo} />
                </span>
              )} />
          </ToolbarGroup>
        </Toolbar>
        {credentials.length ? (
          <div style={styles.toolbar}>
            <RaisedButton
              style={styles.toolbarButton}
              disabled={requesting}
              onClick={this.handleOpenAddDialog}
              label='Add' />
            <RaisedButton
              style={styles.toolbarButton}
              disabled={requesting || selected.length === 0}
              onClick={this.handleDeleteSelectedCredentials}
              label='Remove' />
          </div>
        ) : undefined}
        <div>
          {requesting ? (
            <div style={styles.loading}>
              <Spinner size={30} color={Colors.lightBlue600} speed={0.5} />
            </div>
          ) : (
            this.renderCredentialsTable(serviceName, credentials, selected)
          )}
        </div>
        <KeychainAddDialog
          serviceName={serviceName}
          open={addDialogOpen}
          onRequestClose={this.handleCloseAddDialog}
          currentAccountNames={credentials.map((rec) => rec.account)}
          onSave={this.handleAddCredentials} />
      </div>
    )
  }
}
