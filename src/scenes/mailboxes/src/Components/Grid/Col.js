import PropTypes from 'prop-types'
import 'bootstrap-grid'
import React from 'react'

export default class Col extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    offset: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.node
  }

  /* **************************************************************************/
  // Renderng
  /* **************************************************************************/

  render () {
    const {xs, sm, md, lg, offset, className, children, ...passProps} = this.props

    let mode = 'xs'
    let size = 12
    if (xs !== undefined) {
      mode = 'xs'
      size = xs
    } else if (sm !== undefined) {
      mode = 'sm'
      size = sm
    } else if (md !== undefined) {
      mode = 'md'
      size = md
    } else if (lg !== undefined) {
      mode = 'lg'
      size = lg
    }

    const classNames = [
      ['col', mode, size].join('-'),
      offset !== undefined ? ['col', mode, 'offset', offset].join('-') : undefined,
      className
    ].filter((c) => !!c).join(' ')

    return (
      <div {...passProps} className={classNames}>
        {children}
      </div>
    )
  }
}
