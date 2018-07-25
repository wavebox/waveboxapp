import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/pro-solid-svg-icons/faCheck'
export default class FASCheck extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCheck} />)
  }
}
