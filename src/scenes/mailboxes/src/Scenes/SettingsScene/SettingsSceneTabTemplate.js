const React = require('react')

module.exports = React.createClass({
  displayName: 'SettingsSceneTabTemplate',
  propTypes: {
    children: React.PropTypes.node,
    selected: React.PropTypes.bool,
    style: React.PropTypes.object
  },

  render () {
    const { selected, ...passProps } = this.props

    return selected ? (
      <div {...passProps} />
    ) : false
  }
})
