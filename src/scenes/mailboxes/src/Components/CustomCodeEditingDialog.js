import PropTypes from 'prop-types'
import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/css/css'
import 'codemirror/mode/javascript/javascript'
import { Controlled as CodeMirror } from 'react-codemirror2'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '90%',
    height: '90%'
  },
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'white',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  },
  button: {
    marginLeft: 8,
    marginRight: 8
  },
  editor: {
    position: 'absolute',
    top: 0,
    bottom: 24,
    left: 24,
    right: 24,
    '&>*': {
      height: '100%'
    }
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
    onSave: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['css', 'javascript']).isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.code !== nextProps.code || (this.props.open === false && nextProps.open === true)) {
      this.setState({
        editingCode: nextProps.code
      })
    }
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      editingCode: this.props.code
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleChange = (editor, data, val) => {
    this.setState({ editingCode: val })
  }

  handleSave = (evt) => {
    this.props.onSave(evt, this.state.editingCode)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { onCancel, title, open, classes, mode } = this.props
    const { editingCode } = this.state

    return (
      <Dialog
        disableEnforceFocus
        disableBackdropClick
        disableEscapeKeyDown
        classes={{ paper: classes.dialog }}
        open={open}>
        <DialogTitle>{title || ''}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {open ? (
            <CodeMirror
              value={editingCode}
              className={classes.editor}
              options={{
                mode: mode,
                theme: 'material',
                lineNumbers: true
              }}
              onBeforeChange={this.handleChange} />
          ) : undefined}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button className={classes.button} onClick={(evt) => onCancel(evt)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={this.handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default CustomCodeEditingDialog
