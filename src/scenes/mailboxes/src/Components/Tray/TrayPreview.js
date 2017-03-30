const React = require('react')
const TrayRenderer = require('./TrayRenderer')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'TrayPreview',
  propTypes: {
    tray: React.PropTypes.object.isRequired,
    size: React.PropTypes.number.isRequired,
    unreadCount: React.PropTypes.number
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    const { size, tray, unreadCount } = this.props
    TrayRenderer.renderPNGDataImage(size, tray, unreadCount)
      .then((png) => this.setState({ image: png }))
  },

  componentWillReceiveProps (nextProps) {
    if (shallowCompare(this, nextProps, this.state)) {
      TrayRenderer.renderPNGDataImage(nextProps.size, nextProps.tray, nextProps.unreadCount)
        .then((png) => this.setState({ image: png }))
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { image: null }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { size, style, ...passProps } = this.props
    delete passProps.unreadCount
    delete passProps.tray
    const { image } = this.state

    return (
      <div {...passProps} style={Object.assign({
        width: size + 20,
        height: size + 20,
        backgroundImage: 'linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC), linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC)',
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0, 15px 15px',
        boxShadow: 'inset 0px 0px 10px 0px rgba(0,0,0,0.75)'
      }, style)}>
        {!image ? undefined : (
          <img
            src={image}
            width={size + 'px'}
            height={size + 'px'}
            style={{ margin: 10 }} />
        )}
      </div>
    )
  }
})
