import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, FlatButton, Dialog, TextField } from 'material-ui' //TODO
import shallowCompare from 'react-addons-shallow-compare'
import uuid from 'uuid'

const REF = 'editor'

export default class CustomCodeEditingDialog extends React.Component {
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
    const { onCancel, onSave, title, open, code } = this.props
    const { editingKey } = this.state

    const actions = (
      <div>
        <FlatButton
          label='Cancel'
          style={{ marginRight: 8 }}
          onClick={(evt) => onCancel(evt)} />
        <RaisedButton
          label='Save'
          primary
          onClick={(evt) => onSave(evt, this.refs[REF].getValue())} />
      </div>
    )

    return (
      <Dialog
        modal
        title={title}
        actions={actions}
        open={open}>
        <TextField
          key={editingKey}
          ref={REF}
          name='editor'
          multiLine
          defaultValue={code}
          rows={10}
          rowsMax={10}
          underlineShow={false}
          fullWidth
          textareaStyle={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '14px',
            border: '1px solid rgb(224, 224, 224)',
            borderRadius: 3
          }} />
      </Dialog>
    )
  }
}
