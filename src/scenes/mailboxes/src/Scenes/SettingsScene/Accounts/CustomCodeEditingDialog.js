import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import uuid from 'uuid'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  button: {
    marginLeft: 8,
    marginRight: 8
  },
  textArea: {
    width: 500
  },
  textAreaInput: {
    margin: 0,
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '14px',
    border: '1px solid rgb(224, 224, 224)',
    borderRadius: 3
  }
}

@withStyles(styles)
class CustomCodeEditingDialog extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    title: PropTypes.string,
    open: PropTypes.bool.isRequired,
    code: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.textFieldRef = null
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ editingKey: uuid.v4() })
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      editingKey: uuid.v4()
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { onCancel, onSave, title, open, code, classes } = this.props
    const { editingKey } = this.state

    return (
      <Dialog
        disableEnforceFocus
        disableBackdropClick
        disableEscapeKeyDown
        open={open}>
        {title ? (<DialogTitle>{title}</DialogTitle>) : undefined}
        <DialogContent>
          <TextField
            inputRef={(n) => { this.textFieldRef = n }}
            key={editingKey}
            name='editor'
            multiline
            rowsMax={10}
            rows={10}
            defaultValue={code}
            fullWidth
            className={classes.textArea}
            InputProps={{
              className: classes.textAreaInput,
              disableUnderline: true
            }} />
        </DialogContent>
        <DialogActions>
          <Button className={classes.button} onClick={(evt) => onCancel(evt)}>
            Cancel
          </Button>
          <Button
            variant='raised'
            color='primary'
            className={classes.button}
            onClick={(evt) => onSave(evt, ReactDOM.findDOMNode(this.textFieldRef).value)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default CustomCodeEditingDialog
