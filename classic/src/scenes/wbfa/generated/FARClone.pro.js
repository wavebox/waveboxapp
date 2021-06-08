import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone } from '@fortawesome/pro-regular-svg-icons/faClone'
export default class FARClone extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faClone} />)
  }
}
