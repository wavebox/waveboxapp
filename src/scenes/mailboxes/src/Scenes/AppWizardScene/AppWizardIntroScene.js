import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, RaisedButton, FontIcon, Avatar } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import { settingsActions } from 'stores/settings'

export default class AppWizardIntroScene extends React.Component {
  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return { open: true }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleCancel = () => {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  }

  handleNext = () => {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/app_wizard/tray' }, 250)
  }

  handleNever = () => {
    settingsActions.setHasSeenAppWizard(true)
    this.handleCancel()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

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
}
