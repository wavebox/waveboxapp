import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare } from '@fortawesome/pro-regular-svg-icons/faSquare'

class FAIcon extends React.Component {
  render () {
    const { icon, ...passProps } = this.props
    return (<FontAwesomeIcon icon={icon || faSquare} {...passProps} />)
  }
}

export default FAIcon
