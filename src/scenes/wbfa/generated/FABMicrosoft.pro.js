import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons/faMicrosoft'
export default class FABMicrosoft extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faMicrosoft} />)
  }
}
