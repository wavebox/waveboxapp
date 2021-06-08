import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons/faGoogle'
export default class FABGoogle extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faGoogle} />)
  }
}
