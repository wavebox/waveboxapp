import PropTypes from 'prop-types'
import './AccountStandaloneScene.less'
import React from 'react'
import { Dialog, RaisedButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { WaveboxWebView } from 'Components'
import { userStore } from 'stores/user'
import querystring from 'querystring'

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
    }, 500)
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
      <Dialog
        modal={false}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        bodyClassName='ReactComponent-AccountStandaloneDialog-Body'
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <WaveboxWebView src={url} />
      </Dialog>
    )
  }
}
