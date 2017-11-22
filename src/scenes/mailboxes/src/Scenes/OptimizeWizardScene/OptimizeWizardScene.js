import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton, FlatButton } from 'material-ui'
import { FullscreenModal } from 'Components'
import { settingsActions } from 'stores/settings'
import { Redirect } from 'react-router-dom'

import OptimizeWizardIntroScene from './OptimizeWizardIntroScene'
import OptimizeWizardCompleteScene from './OptimizeWizardCompleteScene'
import OptimizeWizardSleepScene from './OptimizeWizardSleepScene'
import OptimizeWizardSleepDisplayScene from './OptimizeWizardSleepDisplayScene'
import OptimizeWizardSleepCustomizeScene from './OptimizeWizardSleepCustomizeScene'

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

export default class OptimizeWizardScene extends React.Component {
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
  * @param dest='/': the destination to open
  */
  handleClose = (dest = '/') => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = dest
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the content and actions
  * @param step: the step to render
  * @return { content, actions }
  */
  renderContentAndActions (step) {
    if (!step) {
      return {
        content: (<OptimizeWizardIntroScene />),
        actions: (
          <div>
            <FlatButton
              label='Not interested'
              style={styles.modalActionLeftButton}
              onClick={() => { settingsActions.setHasSeenOptimizeWizard(true); this.handleClose() }} />
            <FlatButton
              label='Later'
              style={styles.modalActionExtraButton}
              onClick={() => { this.handleClose() }} />
            <RaisedButton
              label='Start'
              primary
              onClick={() => { window.location.hash = '/optimize_wizard/sleep' }} />
          </div>
        )
      }
    } else if (step === 'sleep') {
      return {
        content: (<OptimizeWizardSleepScene />),
        actions: (
          <div>
            <FlatButton
              style={styles.modalActionLeftButton}
              label='Cancel'
              onClick={() => { this.handleClose() }} />
          </div>
        )
      }
    } else if (step === 'sleep_display') {
      return {
        content: (<OptimizeWizardSleepDisplayScene />),
        actions: (
          <div>
            <FlatButton
              style={styles.modalActionLeftButton}
              label='Cancel'
              onClick={() => { this.handleClose() }} />
          </div>
        )
      }
    } else if (step === 'sleep_advanced') {
      return {
        content: (<OptimizeWizardSleepCustomizeScene />),
        actions: (
          <div>
            <FlatButton
              label='Back'
              style={styles.modalActionLeftButton}
              onClick={() => { window.location.hash = '/optimize_wizard/sleep' }} />
            <FlatButton
              label='Cancel'
              style={styles.modalActionExtraButton}
              onClick={() => { this.handleClose() }} />
            <RaisedButton
              label='Next'
              primary
              onClick={() => { window.location.hash = '/optimize_wizard/finish' }} />
          </div>
        )
      }
    } else if (step === 'finish') {
      return {
        content: (<OptimizeWizardCompleteScene />),
        actions: (
          <div>
            <FlatButton
              label='More Settings'
              style={styles.modalActionExtraButton}
              onClick={() => { settingsActions.setHasSeenOptimizeWizard(true); this.handleClose('/settings/accounts') }} />
            <RaisedButton
              label='Finish'
              primary
              onClick={() => { settingsActions.setHasSeenOptimizeWizard(true); this.handleClose() }} />
          </div>
        )
      }
    } else {
      return { content: undefined, actions: undefined }
    }
  }

  render () {
    const { open } = this.state
    const { match } = this.props
    const step = match.params.step
    if (step === 'start') {
      return (<Redirect to='/optimize_wizard/sleep' />)
    }

    const { content, actions } = this.renderContentAndActions(step)

    return (
      <FullscreenModal
        modal={false}
        bodyStyle={styles.modalBody}
        actionsContainerStyle={styles.modalActions}
        actions={actions}
        open={open}
        onRequestClose={this.handleClose}>
        {content}
      </FullscreenModal>
    )
  }
}
