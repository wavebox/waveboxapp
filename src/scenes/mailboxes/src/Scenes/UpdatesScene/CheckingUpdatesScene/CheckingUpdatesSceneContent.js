import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { DialogContent, DialogActions, Button, LinearProgress } from '@material-ui/core'
import { updaterStore } from 'stores/updater'
import UpdateModalTitle from '../Common/UpdateModalTitle'
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
class CheckingUpdatesSceneContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        provider: PropTypes.oneOf(['squirrel', 'manual']).isRequired
      }).isRequired
    }).isRequired
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const updaterState = updaterStore.getState()
    return {
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
    window.location.hash = '/'
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
    const { isCheckingUpdate, isDownloadingUpdate } = this.state
    const {
      match: { params: { provider } },
      classes
    } = this.props

    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  }
}

export default CheckingUpdatesSceneContent
