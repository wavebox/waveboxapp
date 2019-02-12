import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinux } from '@fortawesome/free-brands-svg-icons/faLinux'
export default class FABLinux extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faLinux} />)
  }
}
