import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import Spinner from 'wbui/Activity/Spinner'
import KeychainStorageInfo from './KeychainStorageInfo'
import KeychainAddDialog from './KeychainAddDialog'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import lightBlue from '@material-ui/core/colors/lightBlue'
import {
  Button, Checkbox,
  Toolbar, Typography,
  Table, TableBody, TableHead, TableRow, TableCell
} from '@material-ui/core'
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
    backgroundColor: grey[200]
  },
  toolbarText: {
    color: grey[600]
  },

  // Action bar
  actionbar: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8
  },
  actionbarButton: {
    marginRight: 8
  },

  // Table
  noneMessage: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: '14px',
    color: grey[600]
  },
  checkboxCell: {
    width: 72
  }
}

@withStyles(styles)
class KeychainScene extends React.Component {
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
  * Handles a row being toggled on or off
  * @param evt: the event that fired
  * @param account: the account id
  */
  handleToggleRowSelection = (evt, account) => {
    this.setState((prevState) => {
      const wasSelected = !!prevState.selected.find((a) => a === account)
      if (wasSelected) {
        return {
          selected: prevState.selected.filter((a) => a !== account)
        }
      } else {
        return {
          selected: prevState.selected.concat([account])
        }
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the crednetials table
  * @param classes: the component classes
  * @param serviceName: the name of the service
  * @param credentials: the credentials to render
  * @param selected: an array of selected items
  * @return jsx
  */
  renderCredentialsTable (classes, serviceName, credentials, selected) {
    if (credentials.length) {
      const selectedIndex = new Set(selected)

      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.checkboxCell} padding='checkbox' />
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {credentials.map((rec) => {
              const isSelected = selectedIndex.has(rec.account)
              return (
                <TableRow
                  key={rec.account}
                  onClick={(evt) => this.handleToggleRowSelection(evt, rec.account)}
                  selected={isSelected}>
                  <TableCell className={classes.checkboxCell} padding='checkbox'>
                    <Checkbox color='primary' checked={isSelected} />
                  </TableCell>
                  <TableCell>
                    {rec.account}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
    } else {
      return (
        <div className={classes.noneMessage}>
          <div>{`No passwords saved for ${serviceName}`}</div>
          <br />
          <Button variant='raised' color='primary' onClick={this.handleOpenAddDialog}>
            Add your first
          </Button>
        </div>
      )
    }
  }

  render () {
    const { serviceName, apiKey, openMode, classes, ...passProps } = this.props
    const { requesting, credentials, selected, addDialogOpen } = this.state

    return (
      <div {...passProps}>
        <Toolbar className={classes.toolbar}>
          <Typography variant='title' className={classes.toolbarText}>
            <span>
              <span className={classes.title}>
                <strong>Saved passwords for </strong>
                <span>{serviceName}</span>
              </span>
              <KeychainStorageInfo className={classes.storageInfo} />
            </span>
          </Typography>
        </Toolbar>
        {credentials.length ? (
          <div className={classes.actionbar}>
            <Button
              variant='raised'
              className={classes.actionbarButton}
              disabled={requesting}
              onClick={this.handleOpenAddDialog}>
              Add
            </Button>
            <Button
              variant='raised'
              className={classes.actionbarButton}
              disabled={requesting || selected.length === 0}
              onClick={this.handleDeleteSelectedCredentials}>
              Remove
            </Button>
          </div>
        ) : undefined}
        <div>
          {requesting ? (
            <div className={classes.loading}>
              <Spinner size={30} color={lightBlue[600]} speed={0.5} />
            </div>
          ) : (
            this.renderCredentialsTable(classes, serviceName, credentials, selected)
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

export default KeychainScene
