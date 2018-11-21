import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash'
export default class FAREyeSlash extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faEyeSlash} />)
  }
}
