import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowMinimize } from '@fortawesome/pro-solid-svg-icons/faWindowMinimize'
export default class FASWindowMinimize extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowMinimize} />)
  }
}
