import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileDownload } from '@fortawesome/pro-solid-svg-icons/faFileDownload'
export default class FASFileDownload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faFileDownload} />)
  }
}
