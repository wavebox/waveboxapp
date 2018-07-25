import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowMinimize } from '@fortawesome/pro-light-svg-icons/faWindowMinimize'
export default class FALWindowMinimize extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowMinimize} />)
  }
}
