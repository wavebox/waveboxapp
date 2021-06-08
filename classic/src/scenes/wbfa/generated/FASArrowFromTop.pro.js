import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowFromTop } from '@fortawesome/pro-solid-svg-icons/faArrowFromTop'
export default class FASArrowFromTop extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowFromTop} />)
  }
}
