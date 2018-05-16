import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, FlatButton, LinearProgress } from 'material-ui' //TODO
import { updaterStore } from 'stores/updater'
import UpdateModalTitle from './UpdateModalTitle'

export default class CheckingUpdatesScene extends React.Component {
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
  * @param provider: the provider that is being used to action the update
  * @param isCheckingUpdate: true if we're checking for updates
  * @param isDownloadingUpdate: true if we're downloading an update
  * @return jsx
  */
  renderMessage (provider, isCheckingUpdate, isDownloadingUpdate) {
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
  * @param provider: the provider that is being used to action the update
  * @param isCheckingUpdate: true if we're checking for updates
  * @param isDownloadingUpdate: true if we're downloading an update
  * @return jsx
  */
  renderSubMessage (provider, isCheckingUpdate, isDownloadingUpdate) {
    if (isDownloadingUpdate) {
      return (
        <p style={{ marginBottom: 0, fontSize: '85%' }}>
          You can minimise this and carry on working. Wavebox will let you know when the update has been downloaded
        </p>
      )
    } else {
      return undefined
    }
  }

  render () {
    const { open, isCheckingUpdate, isDownloadingUpdate } = this.state
    const { match: { params: { provider } } } = this.props

    return (
      <Dialog
        title={(<UpdateModalTitle />)}
        modal={false}
        actions={isDownloadingUpdate ? (<FlatButton label='Minimise' onClick={this.handleMinimize} />) : undefined}
        open={open}
        onRequestClose={this.handleMinimize}>
        {this.renderMessage(provider, isCheckingUpdate, isDownloadingUpdate)}
        <LinearProgress mode='indeterminate' />
        {this.renderSubMessage(provider, isCheckingUpdate, isDownloadingUpdate)}
      </Dialog>
    )
  }
}
