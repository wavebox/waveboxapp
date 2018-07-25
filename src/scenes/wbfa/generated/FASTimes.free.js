import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
export default class FASTimes extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faTimes} />)
  }
}
