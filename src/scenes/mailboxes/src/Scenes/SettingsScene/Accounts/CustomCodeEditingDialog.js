const React = require('react')
const { RaisedButton, FlatButton, Dialog, TextField } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const uuid = require('uuid')

const REF = 'editor'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'CustomCodeEditingDialog',
  propTypes: {
    title: React.PropTypes.string,
    open: React.PropTypes.bool.isRequired,
    code: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ editingKey: uuid.v4() })
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      editingKey: uuid.v4()
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { onCancel, onSave, title, open, code } = this.props
    const { editingKey } = this.state

    const actions = (
      <div>
        <FlatButton
          label='Cancel'
          style={{ marginRight: 8 }}
          onTouchTap={(evt) => onCancel(evt)} />
        <RaisedButton
          label='Save'
          primary
          onTouchTap={(evt) => onSave(evt, this.refs[REF].getValue())} />
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
})
