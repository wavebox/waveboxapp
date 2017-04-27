import PropTypes from 'prop-types'
import 'bootstrap-grid'
import React from 'react'

export default class Row extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <div
        {...this.props}
        className={['row', this.props.className].filter((c) => !!c).join(' ')}>
        {this.props.children}
      </div>
    )
  }
}
