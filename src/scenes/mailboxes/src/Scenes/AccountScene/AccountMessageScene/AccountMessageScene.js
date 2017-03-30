import './AccountMessageScene.less'

const React = require('react')
const { Dialog, RaisedButton } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const { WaveboxWebView } = require('Components')
const { userStore } = require('stores/user')
const { settingsActions } = require('stores/settings')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountMessageScene',

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
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: true,
      url: userStore.getState().user.accountMessageUrl
    }
  },

  userUpdated (userState) {
    this.setState({
      url: userState.user.accountMessageUrl
    })
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose () {
    settingsActions.setSeenAccountMessageUrl(this.state.url)
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
    const { open, url } = this.state

    return (
      <Dialog
        modal={false}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        bodyClassName='ReactComponent-MessageDialog-Body'
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <WaveboxWebView src={url} />
      </Dialog>
    )
  }
})
