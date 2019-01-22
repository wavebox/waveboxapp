import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faApple } from '@fortawesome/free-brands-svg-icons/faApple'
export default class FABApple extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faApple} />)
  }
}
