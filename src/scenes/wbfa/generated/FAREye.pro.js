import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/pro-regular-svg-icons/faEye'
export default class FAREye extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faEye} />)
  }
}
