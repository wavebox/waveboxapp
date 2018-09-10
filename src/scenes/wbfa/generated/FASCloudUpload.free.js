import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt'
export default class FASCloudUpload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCloudUploadAlt} />)
  }
}
