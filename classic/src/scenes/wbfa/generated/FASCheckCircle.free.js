import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle'
export default class FASCheckCircle extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCheckCircle} />)
  }
}
