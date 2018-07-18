import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FARegistry from 'wbfa/FARegistry'

class FAIcon extends React.Component {
  static propTypes = {
    icon: PropTypes.oneOf(Object.keys(FARegistry)).isRequired
  }

  render () {
    const { icon, ...passProps } = this.props
    return (<FontAwesomeIcon icon={FARegistry[icon]} {...passProps} />)
  }
}

export default FAIcon
