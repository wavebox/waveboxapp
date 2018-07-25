import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt'
export default class FASCloudDownload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCloudDownloadAlt} />)
  }
}
