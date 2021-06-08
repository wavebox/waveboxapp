import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowClose } from '@fortawesome/free-regular-svg-icons/faWindowClose'
export default class FALWindowClose extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowClose} />)
  }
}
