import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudDownload } from '@fortawesome/pro-solid-svg-icons/faCloudDownload'
export default class FASCloudDownload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCloudDownload} />)
  }
}
