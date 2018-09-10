import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/pro-solid-svg-icons/faWindowClose'
export default class FASWindowClose extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowClose} />)
  }
}
