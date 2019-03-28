import React from 'react'
import { DialogContent, DialogActions, Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import { settingsActions } from 'stores/settings'
import { withStyles } from '@material-ui/core/styles'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  },
  loadingCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

@withStyles(styles)
class AccountMessageScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      url: userStore.getState().user.accountMessageUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({
      url: userState.user.accountMessageUrl
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
    settingsActions.sub.app.setSeenAccountMessageUrl(this.state.url)
    window.location.hash = '/'
  }

  handleOpenNewWindow = (evt) => {
    const didRoute = WaveboxWebView.routeWaveboxUrl(evt.url)
    if (didRoute) {
      settingsActions.sub.app.setSeenAccountMessageUrl(this.state.url)
    }
    if (!didRoute) {
      WBRPCRenderer.wavebox.openExternal(evt.url)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const { url } = this.state

    return (
      <React.Fragment>
        <DialogContent className={classes.dialogContent}>
          <WaveboxWebView src={url} newWindow={this.handleOpenNewWindow} />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant='contained' color='primary' onClick={this.handleClose}>
            Close
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

export default AccountMessageScene
