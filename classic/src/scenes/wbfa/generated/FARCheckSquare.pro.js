import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare } from '@fortawesome/pro-regular-svg-icons/faCheckSquare'
export default class FARCheckSquare extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCheckSquare} />)
  }
}
