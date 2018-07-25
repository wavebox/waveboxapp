import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/pro-solid-svg-icons/faUserCircle'
export default class FASUserCircle extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faUserCircle} />)
  }
}
