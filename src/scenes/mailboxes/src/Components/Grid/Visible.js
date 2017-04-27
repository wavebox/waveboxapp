import PropTypes from 'prop-types'
import 'bootstrap-grid'
import React from 'react'

export default class Visible extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  static propTypes = {
    hidden: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    visible: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    className: PropTypes.string,
    children: PropTypes.node
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  propTypeToArray (prop) {
    if (Array.isArray(prop)) {
      return prop
    } else if (typeof (prop) === 'string') {
      return prop.split(',')
    } else {
      return []
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

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
}
