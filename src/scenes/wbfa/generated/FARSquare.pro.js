import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare } from '@fortawesome/pro-regular-svg-icons/faSquare'
export default class FARSquare extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSquare} />)
  }
}
