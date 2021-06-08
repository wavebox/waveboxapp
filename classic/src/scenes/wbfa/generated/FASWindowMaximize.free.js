import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons/faWindowMaximize'
export default class FASWindowMaximize extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowMaximize} />)
  }
}
