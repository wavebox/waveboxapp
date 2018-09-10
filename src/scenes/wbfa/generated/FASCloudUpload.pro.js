import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUpload } from '@fortawesome/pro-solid-svg-icons/faCloudUpload'
export default class FASCloudUpload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCloudUpload} />)
  }
}
