import React from 'react'
import PropTypes from 'prop-types'
import { FontIcon, Dialog, RaisedButton, FlatButton } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'
import { settingsStore } from 'stores/settings'

const styles = {
  container: {
    textAlign: 'center'
  },
  tick: {
    color: Colors.green600,
    fontSize: '80px'
  },
  instruction: {
    textAlign: 'center'
  }
}

export default class MailboxWizardCompleteScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxId: PropTypes.string.isRequired
      })
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      hasSeenAppWizard: settingsStore.getState().app.hasSeenAppWizard,
      open: true
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({ hasSeenAppWizard: settingsStore.getState().app.hasSeenAppWizard })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the settings button being pressed
  */
  handleSettings = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = `/settings/accounts/${this.props.match.params.mailboxId}`
    }, 250)
  }

  /**
  * Handles the done button being pressed
  */
  handleDone = () => {
    const { hasSeenAppWizard } = this.state

    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = hasSeenAppWizard ? '/' : '/app_wizard'
    }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { open } = this.state
    const actions = (
      <div>
        <FlatButton label='Account Settings' onClick={this.handleSettings} style={{ marginRight: 8 }} />
        <RaisedButton label='Finish' primary onClick={this.handleDone} />
      </div>
    )

    return (
      <Dialog
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        actions={actions}
        open={open}
        autoScrollBodyContent>
        <div style={styles.container}>
          <FontIcon className='material-icons' style={styles.tick}>check_circle</FontIcon>
          <h3>All Done!</h3>
          <p style={styles.instruction}>
            You can change your mailbox settings at any time in the settings
          </p>
        </div>
      </Dialog>
    )
  }
}
