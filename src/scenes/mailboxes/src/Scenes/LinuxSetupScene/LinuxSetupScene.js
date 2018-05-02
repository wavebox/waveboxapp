import React from 'react'
import { Dialog, FlatButton, RaisedButton, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import electron from 'electron'
import Resolver from 'Runtime/Resolver'

export default class LinuxSetupScene extends React.Component {
  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    open: true,
    hasVisitedFontLink: false
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleFontsClick = () => {
    this.setState({ hasVisitedFontLink: true })
    electron.shell.openExternal('https://wavebox.io/kb/installing-linux-fonts')
  }

  handleClose = () => {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 250)
  }

  handleDone = () => {
    settingsActions.sub.app.setHasSeenLinuxSetupMessage(true)
    this.handleClose()
  }

  handleRemindNextTime = () => {
    this.handleClose()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    if (process.platform !== 'linux') { return false }
    const { open, hasVisitedFontLink } = this.state

    const actions = (
      <div>
        <FlatButton
          label={`Don't remind me again`}
          style={{ marginRight: 16, float: 'left' }}
          onClick={this.handleDone} />
        <FlatButton
          label='Remind me later'
          style={{ marginRight: 16, float: 'left' }}
          onClick={this.handleRemindNextTime} />
        {hasVisitedFontLink ? (
          <RaisedButton
            primary
            label={`Done`}
            icon={<FontIcon className='material-icons'>check_circle</FontIcon>}
            onClick={this.handleDone} />
        ) : (
          <RaisedButton
            primary
            label={`Find out how`}
            icon={<FontIcon className='material-icons'>font_download</FontIcon>}
            onClick={this.handleFontsClick} />
        )}
      </div>
    )

    return (
      <Dialog
        title={(
          <div>
            <FontIcon className='material-icons'>widgets</FontIcon>
            <span> Finish your Wavebox install</span>
          </div>
        )}
        modal={false}
        actions={actions}
        open={open}
        onRequestClose={this.handleRemindNextTime}>
        <div style={{
          width: '100%',
          height: 250,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url("${Resolver.image('linux_font_setup.png')}")`
        }} />
        <p>
          <span>
            To get the best out of Wavebox, we recommend installing some additional fonts
            on your system. There's some information available in our Knowledge base on how
            to do this
          </span>
          &nbsp;
          <span
            onClick={this.handleFontsClick}
            style={{textDecoration: 'underline', cursor: 'pointer'}}>
            wavebox.io/kb/installing-linux-fonts
          </span>
        </p>
      </Dialog>
    )
  }
}
