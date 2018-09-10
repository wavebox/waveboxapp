import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowMaximize } from '@fortawesome/pro-light-svg-icons/faWindowMaximize'
export default class FALWindowMaximize extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowMaximize} />)
  }
}
