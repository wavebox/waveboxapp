const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Dialog, RaisedButton, FontIcon, Avatar } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const { settingsActions } = require('stores/settings')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AppWizardIntroScene',

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
    setTimeout(() => { window.location.hash = '/app_wizard/tray' }, 250)
  },

  handleNever () {
    settingsActions.setHasSeenAppWizard(true)
    this.handleCancel()
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
          label='Not interested'
          style={{ float: 'left' }}
          onClick={this.handleNever} />
        <RaisedButton
          label='Later'
          onClick={this.handleCancel} />
        <RaisedButton
          label='Setup'
          style={{ marginLeft: 8 }}
          primary
          onClick={this.handleNext} />
      </div>
    )

    return (
      <Dialog
        modal={false}
        actions={actions}
        open={open}
        autoScrollBodyContent
        onRequestClose={this.handleCancel}>
        <div style={{ textAlign: 'center' }}>
          <Avatar
            color={Colors.yellow600}
            backgroundColor={Colors.blueGrey900}
            icon={(<FontIcon className='fa fa-fw fa-magic' />)}
            size={80} />
          <h3>Wavebox Setup</h3>
          <p>
            Customise Wavebox to work best for you by configuring a few common settings
          </p>
          <p>
            Would you like to start Wavebox setup now?
          </p>
        </div>
      </Dialog>
    )
  }
})
