import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowToBottom } from '@fortawesome/pro-solid-svg-icons/faArrowToBottom'
export default class FASArrowToBottom extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowToBottom} />)
  }
}
