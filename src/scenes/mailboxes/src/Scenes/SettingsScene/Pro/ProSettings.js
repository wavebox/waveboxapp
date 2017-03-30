const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { WaveboxWebView } = require('Components')
const { userStore } = require('stores/user')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ProSettings',
  propTypes: {
    showRestart: React.PropTypes.func.isRequired
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
      url: userStore.getState().user.billingUrl
    }
  },

  userUpdated (userState) {
    this.setState({ url: userState.user.billingUrl })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {style, ...passProps} = this.props
    delete passProps.showRestart
    const { url } = this.state

    return (
      <WaveboxWebView
        src={url}
        style={Object.assign({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }, style)} />
    )
  }
})
