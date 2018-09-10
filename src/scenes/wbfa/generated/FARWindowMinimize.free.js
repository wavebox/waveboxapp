import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWindowMinimize } from '@fortawesome/free-regular-svg-icons/faWindowMinimize'
export default class FARWindowMinimize extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faWindowMinimize} />)
  }
}
