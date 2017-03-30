import './ProScene.less'

const React = require('react')
const { Dialog, RaisedButton } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const { WaveboxWebView } = require('Components')
const { userStore } = require('stores/user')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ProScene',

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    userStore.listen(this.userChanged)
  },

  componentWillUnmount () {
    userStore.unlisten(this.userChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: true,
      url: userStore.getState().user.proUrl
    }
  },

  userChanged (userState) {
    this.setState({
      url: userState.user.proUrl
    })
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
    const { open, url } = this.state

    return (
      <Dialog
        modal={false}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        actionsContainerStyle={{ position: 'relative' }}
        actions={(<RaisedButton primary label='Close' onClick={this.handleClose} />)}
        open={open}
        bodyClassName='ReactComponent-ProDialog-Body'
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <WaveboxWebView src={url} />
      </Dialog>
    )
  }
})
