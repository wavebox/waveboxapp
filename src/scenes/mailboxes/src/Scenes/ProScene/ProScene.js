import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import { withStyles } from '@material-ui/core/styles'
import { Dialog, DialogContent, DialogActions, Button } from '@material-ui/core'

const styles = {
  dialog: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  },
  dialogContent: {
    position: 'relative'
  },
  dialogActions: {
    backgroundColor: 'rgb(242, 242, 242)',
    borderTop: '1px solid rgb(232, 232, 232)',
    margin: 0,
    padding: '8px 4px'
  }
}

@withStyles(styles)
class ProScene extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  }

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      url: userStore.getState().user.proUrl
    }
  })()

  userChanged = (userState) => {
    this.setState({
      url: userState.user.proUrl
    })
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose = () => {
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
    const { classes } = this.props
    const { open, url } = this.state

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleClose}
        classes={{ paper: classes.dialog }}>
        <DialogContent className={classes.dialogContent}>
          <WaveboxWebView
            hasToolbar
            didStartLoading={() => this.setState({ isLoading: true })}
            didStopLoading={() => this.setState({ isLoading: false })}
            src={url} />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant='raised' color='primary' onClick={this.handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ProScene
