import PropTypes from 'prop-types'
import React from 'react'
import { settingsStore, settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import StyleMixins from 'wbui/Styles/StyleMixins'
import {
  DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, Typography, TextField, Tooltip, IconButton,
  Select, MenuItem
} from '@material-ui/core'
import WarningIcon from '@material-ui/icons/Warning'
import DeleteIcon from '@material-ui/icons/Delete'
import ConfirmButton from 'wbui/ConfirmButton'
import LinkIcon from '@material-ui/icons/Link'
import AddIcon from '@material-ui/icons/Add'
import orange from '@material-ui/core/colors/orange'

const CMD_PLACEHOLDERS = {
  darwin: 'open',
  win32: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe`,
  linux: 'google-chrome'
}
const ARG_TYPES = {
  STRING: 'STRING',
  URL: 'URL'
}

const styles = {
  dialogTitle: {
    paddingBottom: 0
  },
  dialogTitleWarning: {
    color: orange[700],
    fontSize: '14px',
    '& svg': {
      fontSize: '20px',
      verticalAlign: 'sub'
    }
  },
  dialogContent: {
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  argumentTableTitle: {
    marginTop: 18
  },
  argumentTableHeadRow: {
    height: 36
  },
  argumentInputField: {
    marginTop: 8
  },
  dialogActions: {
    justifyContent: 'space-between'
  },
  microButton: {
    paddingTop: 1,
    paddingBottom: 1,
    '& svg': {
      fontSize: '20px'
    }
  }
}

@withStyles(styles)
class CustomLinkProviderEditorDialogContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    providerId: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.providerId !== nextProps.providerId) {
      this.setState(
        this.extractInitialProviderState(nextProps.providerId, settingsStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractInitialProviderState(this.props.providerId, settingsStore.getState())
    }
  })()

  /**
  * Extracts the initial provider state
  * @param providerId: the id of the provider
  * @param settingsState: the settings to get provider from
  * @return state update with provider info
  */
  extractInitialProviderState (providerId, settingsState) {
    const provider = settingsState.os.getCustomLinkProvider(providerId)
    return {
      nameError: undefined,
      cmdError: undefined,
      ...(provider ? {
        isCreatingNew: false,
        name: provider.name,
        cmd: provider.cmd,
        args: provider.args
      } : {
        isCreatingNew: true,
        name: '',
        cmd: '',
        args: []
      })
    }
  }

  /* **************************************************************************/
  // UI Events: Args
  /* **************************************************************************/

  /**
  * Changes the argument type at an index
  * @param index: the index of the arg to change
  * @param type: the new type
  */
  handleChangeArgType = (index, type) => {
    if (type === ARG_TYPES.STRING) {
      this.handleSetArg(index, '')
    } else if (type === ARG_TYPES.URL) {
      this.handleSetArg(index, { type: 'url' })
    }
  }

  /**
  * Changes the argument at an index
  * @param index: the index of the arg to change
  * @param value: the new value
  */
  handleSetArg = (index, value) => {
    this.setState((prevState) => {
      return {
        args: [].concat(
          prevState.args.slice(0, index),
          [value],
          prevState.args.slice(index + 1)
        )
      }
    })
  }

  /**
  * Adds an argument
  */
  handleAddArg = () => {
    this.setState((prevState) => {
      return {
        args: [].concat(prevState.args, '')
      }
    })
  }

  /**
  * Removes an argument
  * @param index: the index of the argument
  */
  handleRemoveArg = (index) => {
    this.setState((prevState) => {
      return {
        args: [].concat(
          prevState.args.slice(0, index),
          prevState.args.slice(index + 1)
        )
      }
    })
  }

  /* **************************************************************************/
  // UI Events: Top level
  /* **************************************************************************/

  /**
  * Handles deleting the provider
  * @param evt: the event that fired
  */
  handleDelete = (evt) => {
    settingsActions.removeCustomLinkProvider(this.props.providerId)
    this.props.onRequestClose()
  }

  /**
  * Handles saving the provider
  * @param evt: the event that fired
  */
  handleSave = (evt) => {
    const {
      name,
      cmd,
      args
    } = this.state

    // Validate
    let hasErrors = false
    const stateUpdate = {
      nameError: undefined,
      cmdError: undefined
    }
    if (!name) {
      hasErrors = true
      stateUpdate.nameError = 'Name is required'
    }
    if (!cmd) {
      hasErrors = true
      stateUpdate.cmdError = 'Command is required'
    }
    this.setState(stateUpdate)

    if (!hasErrors) {
      settingsActions.setCustomLinkProvider(this.props.providerId, {
        name: name,
        cmd: cmd,
        args: args
      })
      this.props.onRequestClose()
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders an arg row
  * @param classes: the classes to use
  * @param arg: the arg to render
  * @param i: the index of the arg
  * @return jsx
  */
  renderArgRow (classes, arg, i) {
    let argType = ARG_TYPES.STRING
    if (typeof (arg) === 'string') {
      argType = ARG_TYPES.STRING
    } else if (typeof (arg) === 'object' && arg.type === 'url') {
      argType = ARG_TYPES.URL
    }

    return (
      <TableRow key={`${i}`}>
        <TableCell>
          <Select
            value={argType}
            fullWidth
            MenuProps={{ MenuListProps: { dense: true } }}
            onChange={(evt) => this.handleChangeArgType(i, evt.target.value)}>
            <MenuItem value={ARG_TYPES.STRING}>String</MenuItem>
            <MenuItem value={ARG_TYPES.URL}>URL</MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          {argType === ARG_TYPES.STRING ? (
            <TextField
              fullWidth
              placeholder='-a'
              InputLabelProps={{ shrink: true }}
              className={classes.argumentInputField}
              margin='normal'
              value={arg}
              onChange={(evt) => this.handleSetArg(i, evt.target.value)} />
          ) : undefined}
          {argType === ARG_TYPES.URL ? (
            <LinkIcon />
          ) : undefined}
        </TableCell>
        <TableCell align='right'>
          <Tooltip title='Remove'>
            <IconButton onClick={(evt) => this.handleRemoveArg(i)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    )
  }

  render () {
    const {
      classes,
      onRequestClose
    } = this.props
    const {
      isCreatingNew,
      name,
      nameError,
      cmd,
      cmdError,
      args
    } = this.state

    return (
      <React.Fragment>
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant='h6'>
            {isCreatingNew ? (
              `Create a new command to open links`
            ) : (
              `Edit a command to open links`
            )}
          </Typography>
          <Typography variant='subtitle1'>
            <div>A custom link opener runs a shell command to open another app</div>
            <div className={classes.dialogTitleWarning}>
              <WarningIcon /> This feature is only recommended for advanced users
            </div>
          </Typography>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder='My custom link opener'
            label='Name'
            margin='normal'
            value={name}
            error={!!nameError}
            helperText={nameError}
            onChange={(evt) => this.setState({ name: evt.target.value })} />
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder={CMD_PLACEHOLDERS[process.platform]}
            label='Run command (Command or path of app to run)'
            margin='normal'
            value={cmd}
            error={!!cmdError}
            helperText={cmdError}
            onChange={(evt) => this.setState({ cmd: evt.target.value })} />
          <Typography variant='subtitle2' className={classes.argumentTableTitle}>
            Arguments to pass to the run command...
          </Typography>
          <Table padding='dense'>
            <TableHead>
              <TableRow className={classes.argumentTableHeadRow}>
                <TableCell>Argument type</TableCell>
                <TableCell>Argument value</TableCell>
                <TableCell align='right'>
                  <Button
                    size='small'
                    variant='outlined'
                    className={classes.microButton}
                    onClick={this.handleAddArg}>
                    <AddIcon /> Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {args.length ? (
                args.map((arg, i) => this.renderArgRow(classes, arg, i))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align='center'>
                    <Button size='small' variant='outlined' onClick={this.handleAddArg}>
                      Add your first argument
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          {isCreatingNew ? (
            <Button variant='contained' onClick={onRequestClose}>
              Cancel
            </Button>
          ) : (
            <span>
              <ConfirmButton
                content='Delete'
                confirmContent='Click again to confirm'
                confirmWaitMs={4000}
                onConfirmedClick={this.handleDelete} />
              <Button onClick={onRequestClose}>
                Discard Changes
              </Button>
            </span>
          )}
          <Button variant='contained' color='primary' onClick={this.handleSave}>
            Save
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default CustomLinkProviderEditorDialogContent
