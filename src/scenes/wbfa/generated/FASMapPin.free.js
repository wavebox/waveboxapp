import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapPin } from '@fortawesome/free-solid-svg-icons/faMapPin'
export default class FASMapPin extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faMapPin} />)
  }
}
