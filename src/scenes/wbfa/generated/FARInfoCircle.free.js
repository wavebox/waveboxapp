import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle'
export default class FARInfoCircle extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faInfoCircle} />)
  }
}
