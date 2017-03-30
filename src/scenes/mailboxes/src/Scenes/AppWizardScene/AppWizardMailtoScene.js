const React = require('react')
const { platformActions } = require('stores/platform')
const shallowCompare = require('react-addons-shallow-compare')
const { Dialog, RaisedButton } = require('material-ui')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AppWizardMailtoScene',

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { open: true }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleCancel () {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  },

  handleNext () {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/app_wizard/complete' }, 250)
  },

  handleMakeDefaultClient () {
    platformActions.changeMailtoLinkHandler(true)
    this.handleNext()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <RaisedButton
          label='Cancel'
          style={{ float: 'left' }}
          onClick={this.handleCancel} />
        <RaisedButton
          label='Later'
          onClick={this.handleNext} />
        <RaisedButton
          label='Make default mail client'
          style={{ marginLeft: 8 }}
          primary
          onClick={this.handleMakeDefaultClient} />
      </div>
    )

    return (
      <Dialog
        modal={false}
        title='Default Mail Client'
        actions={actions}
        open={open}
        autoScrollBodyContent
        onRequestClose={this.handleCancel}>
        <div style={{textAlign: 'center'}}>
          <p>
            Would you like to make Wavebox your default mail client?
            <br />
            <small>You can always change this later</small>
          </p>
        </div>
      </Dialog>
    )
  }
})
