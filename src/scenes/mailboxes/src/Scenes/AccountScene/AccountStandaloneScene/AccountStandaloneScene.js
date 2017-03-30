import './AccountStandaloneScene.less'

const React = require('react')
const { Dialog, RaisedButton } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const { WaveboxWebView } = require('Components')
const { userStore } = require('stores/user')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountStandaloneScene',
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  propTypes: {
    location: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userUpdated)
  },

  componentWillUnmount () {
    userStore.unlisten(this.userUpdated)
  },
  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: true,
      billingUrl: userStore.getState().user.billingUrl
    }
  },

  userUpdated (userState) {
    this.setState({ billingUrl: userState.user.billingUrl })
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose () {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { open, billingUrl } = this.state
    const url = this.props.location.query.url || billingUrl

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
})
