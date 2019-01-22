import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows'
export default class FABWindows extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindows} />)
  }
}
