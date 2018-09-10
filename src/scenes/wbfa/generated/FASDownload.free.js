import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
export default class FASDownload extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faDownload} />)
  }
}
