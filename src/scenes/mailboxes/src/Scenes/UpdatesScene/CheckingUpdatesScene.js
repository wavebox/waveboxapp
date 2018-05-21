import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, DialogContent, DialogActions, Button, LinearProgress } from '@material-ui/core'
import { updaterStore } from 'stores/updater'
import UpdateModalTitle from './UpdateModalTitle'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  submessage: {
    marginBottom: 0,
    fontSize: '85%'
  },
  dialogContent: {
    width: 600
  }
}

@withStyles(styles)
class CheckingUpdatesScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes: {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual'])
      })
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    updaterStore.listen(this.updaterStoreChanged)
  }

  componentWillUnmount () {
    updaterStore.unlisten(this.updaterStoreChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const updaterState = updaterStore.getState()
    return {
      open: true,
      isCheckingUpdate: updaterState.isCheckingUpdate(),
      isDownloadingUpdate: updaterState.isDownloadingUpdate()
    }
  })()

  updaterStoreChanged = (updaterState) => {
    this.setState({
      isCheckingUpdate: updaterState.isCheckingUpdate(),
      isDownloadingUpdate: updaterState.isDownloadingUpdate()
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleMinimize = () => {
    this.setState({ open: false })
    setTimeout(() => { window.location.hash = '/' }, 500)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the message
  * @param classes:
  * @param provider: the provider that is being used to action the update
  * @param isCheckingUpdate: true if we're checking for updates
  * @param isDownloadingUpdate: true if we're downloading an update
  * @return jsx
  */
  renderMessage (classes, provider, isCheckingUpdate, isDownloadingUpdate) {
    if (isCheckingUpdate) {
      return (<p>Wavebox is checking for updates...</p>)
    } else if (isDownloadingUpdate) {
      return (<p>Wavebox is downloading an update...</p>)
    } else {
      return undefined
    }
  }

  /**
  * Renders the message
  * @param classes:
  * @param provider: the provider that is being used to action the update
  * @param isCheckingUpdate: true if we're checking for updates
  * @param isDownloadingUpdate: true if we're downloading an update
  * @return jsx
  */
  renderSubMessage (classes, provider, isCheckingUpdate, isDownloadingUpdate) {
    if (isDownloadingUpdate) {
      return (
        <p className={classes.submessage}>
          You can minimise this and carry on working. Wavebox will let you know when the update has been downloaded
        </p>
      )
    } else {
      return undefined
    }
  }

  render () {
    const { open, isCheckingUpdate, isDownloadingUpdate } = this.state
    const {
      match: { params: { provider } },
      classes
    } = this.props

    return (
      <Dialog
        disableEnforceFocus
        open={open}
        onClose={this.handleMinimize}>
        <UpdateModalTitle />
        <DialogContent className={classes.dialogContent}>
          {this.renderMessage(classes, provider, isCheckingUpdate, isDownloadingUpdate)}
          <LinearProgress mode='indeterminate' />
          {this.renderSubMessage(classes, provider, isCheckingUpdate, isDownloadingUpdate)}
        </DialogContent>
        <DialogActions>
          {isDownloadingUpdate ? (
            <Button onClick={this.handleMinimize}>
              Minimise
            </Button>
          ) : undefined}
        </DialogActions>
      </Dialog>
    )
  }
}

export default CheckingUpdatesScene
