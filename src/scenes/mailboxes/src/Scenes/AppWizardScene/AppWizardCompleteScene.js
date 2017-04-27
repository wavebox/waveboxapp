import React from 'react'
import { mailboxStore } from 'stores/mailbox'
import { settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, RaisedButton, FontIcon } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'

const styles = {
  container: {
    textAlign: 'center'
  },
  tick: {
    color: Colors.green600,
    fontSize: '80px'
  }
}

export default class AppWizardCompleteScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesUpdated)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      mailboxCount: mailboxStore.getState().mailboxCount(),
      open: true
    }
  })()

  mailboxesUpdated = (mailboxState) => {
    this.setState({
      mailboxCount: mailboxState.mailboxCount()
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleNext = () => {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/mailbox_wizard/add' }, 750)
  }

  handleFinish = () => {
    settingsActions.setHasSeenAppWizard(true)
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxCount, open } = this.state
    const actions = (
      <div>
        <RaisedButton
          label='Cancel'
          style={{ float: 'left' }}
          onClick={() => this.handleFinish} />
        <RaisedButton
          label='Finish'
          primary={mailboxCount !== 0}
          onClick={this.handleFinish} />
        {mailboxCount === 0 ? (
          <RaisedButton
            label='Add First Mailbox'
            style={{marginLeft: 8}}
            primary
            onClick={this.handleNext} />
        ) : undefined}
      </div>
    )

    return (
      <Dialog
        modal={false}
        actions={actions}
        open={open}
        autoScrollBodyContent
        onRequestClose={this.handleFinish}>
        <div style={styles.container}>
          <FontIcon className='material-icons' style={styles.tick}>check_circle</FontIcon>
          <h3>All Done!</h3>
          <p>
            You can go to settings at any time to update your preferences
          </p>
        </div>
      </Dialog>
    )
  }
}
