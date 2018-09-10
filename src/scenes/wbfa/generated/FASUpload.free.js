import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
export default class FASUpload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faUpload} />)
  }
}
