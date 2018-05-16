import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { Dialog, RaisedButton } from 'material-ui' //TODO
import UpdateModalTitle from './UpdateModalTitle'
import pkg from 'package.json'

export default class UpdateNoneScene extends React.Component {
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
  // Data Lifecycle
  /* **************************************************************************/

  state = {
    open: true
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Closes the dialog
  */
  handleClose = () => {
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
    const { open } = this.state

    return (
      <Dialog
        title={(<UpdateModalTitle iconName='done' />)}
        modal={false}
        actions={(<RaisedButton label='Done' onClick={this.handleClose} />)}
        open={open}
        onRequestClose={this.handleClose}>
        <p>Your version of Wavebox is up to date</p>
        <p style={{ fontSize: '85%' }}>You're currently using Wavebox version <strong>{pkg.version}</strong></p>
      </Dialog>
    )
  }
}
