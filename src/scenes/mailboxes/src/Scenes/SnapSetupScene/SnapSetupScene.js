import React from 'react'
import { Dialog, FlatButton, RaisedButton, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import DistributionConfig from 'Runtime/DistributionConfig'

const styles = {
  codeBlock: {
    padding: 8,
    fontSize: 14,
    lineHeight: 1.4,
    color: '#333333',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    backgroundColor: '#F5F5F5',
    border: '1px solid #CCCCCC',
    borderRadius: 4
  },
  codeInline: {
    padding: 2,
    fontSize: 14,
    lineHeight: 1.4,
    color: '#333333',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    backgroundColor: '#F5F5F5',
    border: '1px solid #CCCCCC',
    borderRadius: 4,
    verticalAlign: 'middle'
  }
}

export default class ProScene extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleDone = () => {
    settingsActions.setHasSeenSnapSetupMessage(true)
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  handleRemindNextTime = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    if (!DistributionConfig.isSnapInstall) { return false }
    const { open } = this.state

    const actions = (
      <div>
        <FlatButton
          label='Remind me later'
          style={{ marginRight: 16 }}
          onClick={this.handleRemindNextTime} />
        <RaisedButton
          primary
          label={`I've done this`}
          onClick={this.handleDone} />
      </div>
    )

    return (
      <Dialog
        title={(
          <div>
            <FontIcon className='material-icons'>widgets</FontIcon>
            <span> Finish your snap install</span>
          </div>
        )}
        modal={false}
        actions={actions}
        open={open}
        onRequestClose={this.handleRemindNextTime}>
        <p>
          To make sure that everything works seamlessly with your Snap install of Wavebox
          you may need to install some additional libraries:
        </p>
        <ul>
          <li>
            <code style={styles.codeInline}>snapd-xdg-open</code> which enables Wavebox to open
            links in your default web browser and files in your file manager. This can be installed
            through your package managed, for example if you're using debian you can use:
            <p>
              <code style={styles.codeBlock}>sudo apt install snapd-xdg-open</code>
            </p>
          </li>
        </ul>
      </Dialog>
    )
  }
}
