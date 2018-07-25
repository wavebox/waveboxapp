import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/pro-solid-svg-icons/faCircle'
export default class FASCircle extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faCircle} />)
  }
}
