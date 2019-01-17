import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
export default class FASArrowToBottom extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowDown} />)
  }
}
