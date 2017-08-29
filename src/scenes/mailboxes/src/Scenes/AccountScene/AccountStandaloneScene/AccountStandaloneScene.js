import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView, FullscreenModal } from 'Components'
import { userStore } from 'stores/user'
import querystring from 'querystring'

const styles = {
  modalActions: {
    position: 'absolute',
    height: 52,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTop: '1px solid rgb(232, 232, 232)',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2
  },
  modalBody: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 52,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  }
}

export default class AccountStandaloneScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  static propTypes = {
    location: PropTypes.shape({
      search: PropTypes.string
    })
  }

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
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      billingUrl: userStore.getState().user.billingUrl
    }
  })()

  userUpdated = (userState) => {
    this.setState({ billingUrl: userState.user.billingUrl })
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
    const { open, billingUrl } = this.state
    const { location } = this.props
    const url = querystring.parse(location.search.substr(1)).url || billingUrl

    return (
      <FullscreenModal
        modal={false}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        actionsContainerStyle={styles.modalActions}
        bodyStyle={styles.modalBody}
        onRequestClose={this.handleClose}>
        <WaveboxWebView src={url} />
      </FullscreenModal>
    )
  }
}
