import 'bootstrap-grid'

const React = require('react')

module.exports = React.createClass({
  displayName: 'GridVisible',

  propTypes: {
    hidden: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.string),
      React.PropTypes.string
    ]),
    visible: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.string),
      React.PropTypes.string
    ]),
    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  propTypeToArray (prop) {
    if (Array.isArray(prop)) {
      return prop
    } else if (typeof (prop) === 'string') {
      return prop.split(',')
    } else {
      return []
    }
  },

  render () {
    const { hidden, visible, className, children, ...passProps } = this.props

    const classNames = [
      this.propTypeToArray(hidden).map((c) => 'hidden-' + c).join(' '),
      this.propTypeToArray(visible).map((c) => 'visible-' + c).join(' '),
      className
    ].filter((c) => !!c).join(' ')

    return (
      <div {...passProps} className={classNames}>
        {children}
      </div>
    )
  }
})
