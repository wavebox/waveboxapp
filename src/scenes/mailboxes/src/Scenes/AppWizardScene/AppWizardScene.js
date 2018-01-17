import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton, FlatButton } from 'material-ui'
import { FullscreenModal } from 'Components'
import { settingsActions } from 'stores/settings'
import { platformStore } from 'stores/platform'
import { Redirect } from 'react-router-dom'

import AppWizardIntroScene from './AppWizardIntroScene'
import AppWizardTrayScene from './AppWizardTrayScene'
import AppWizardMailtoScene from './AppWizardMailtoScene'
import AppWizardCompleteScene from './AppWizardCompleteScene'

const styles = {
  // Modal
  modalBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 52,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: 'rgb(242, 242, 242)'
  },
  modalActions: {
    position: 'absolute',
    height: 52,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(242, 242, 242)',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2
  },
  modalActionExtraButton: {
    marginRight: 8
  },
  modalActionLeftButton: {
    float: 'left'
  }
}

export default class AppWizardScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        step: PropTypes.string
      })
    })
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles the user cancelling the wizard
  */
  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /**
  * Handles the user pressing next
  */
  handleNext = () => {
    const step = this.props.match.params.step
    if (!step) {
      window.location.hash = '/app_wizard/tray'
    } else if (step === 'tray') {
      if (platformStore.getState().mailtoLinkHandlerSupported()) {
        window.location.hash = '/app_wizard/mailto'
      } else {
        window.location.hash = '/app_wizard/finish'
      }
    } else if (step === 'mailto') {
      window.location.hash = '/app_wizard/finish'
    }
  }

  /**
  * Handles the user electing not to do the wizard
  */
  handleNever = () => {
    settingsActions.sub.app.setHasSeenAppWizard(true)
    settingsActions.tourNextIfActive()
    this.handleClose()
  }

  /**
  * Handles the user finishing the wizard
  */
  handleFinish = () => {
    settingsActions.sub.app.setHasSeenAppWizard(true)
    settingsActions.tourNextIfActive()
    this.handleClose()
  }

  /**
  * Handles the user finish the wizard and continuing to settings
  */
  handleFinishSettings = () => {
    settingsActions.sub.app.setHasSeenAppWizard(true)
    settingsActions.tourNextIfActive()
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/settings'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the actions
  * @param step: the current step
  * @return jsx
  */
  renderActions (step) {
    if (!step) {
      return (
        <div>
          <FlatButton
            label='Not interested'
            style={styles.modalActionLeftButton}
            onClick={this.handleNever} />
          <FlatButton
            label='Later'
            style={styles.modalActionExtraButton}
            onClick={this.handleClose} />
          <RaisedButton
            label='Start'
            primary
            onClick={this.handleNext} />
        </div>
      )
    } else if (step === 'tray' || step === 'mailto') {
      return (
        <div>
          <FlatButton
            label='Cancel'
            style={styles.modalActionExtraButton}
            onClick={this.handleClose} />
          <RaisedButton
            label='Next'
            primary
            onClick={this.handleNext} />
        </div>
      )
    } else if (step === 'finish') {
      return (
        <div>
          <FlatButton
            label='More Settings'
            style={styles.modalActionExtraButton}
            onClick={this.handleFinishSettings} />
          <RaisedButton
            label='Finish'
            primary
            onClick={this.handleFinish} />
        </div>
      )
    } else {
      return undefined
    }
  }

  /**
  * Renders the actions
  * @param step: the current step
  * @return jsx
  */
  renderContent (step) {
    if (!step) {
      return (<AppWizardIntroScene />)
    } else if (step === 'tray') {
      return (<AppWizardTrayScene />)
    } else if (step === 'mailto') {
      return (<AppWizardMailtoScene onRequestNext={this.handleNext} />)
    } else if (step === 'finish') {
      return (<AppWizardCompleteScene />)
    } else {
      return undefined
    }
  }

  render () {
    const { open } = this.state
    const { match } = this.props
    const step = match.params.step

    if (step === 'start') {
      return (<Redirect to='/app_wizard/tray' />)
    }

    return (
      <FullscreenModal
        modal={false}
        bodyStyle={styles.modalBody}
        actionsContainerStyle={styles.modalActions}
        actions={this.renderActions(step)}
        open={open}
        onRequestClose={this.handleClose}>
        {this.renderContent(step)}
      </FullscreenModal>
    )
  }
}
