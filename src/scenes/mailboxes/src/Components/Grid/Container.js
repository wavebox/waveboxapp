import PropTypes from 'prop-types'
import 'bootstrap-grid'
import React from 'react'

export default class Container extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    fluid: PropTypes.bool
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {fluid, className, ...passProps} = this.props

    const classNames = [
      fluid ? 'container-fluid' : 'conainer',
      className
    ].filter((c) => !!c).join(' ')

    return (
      <div {...passProps} className={classNames}>
        {this.props.children}
      </div>
    )
  }
}
