import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
export default class FASArrowFromTop extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowUp} />)
  }
}
