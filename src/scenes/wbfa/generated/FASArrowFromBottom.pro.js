import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowFromBottom } from '@fortawesome/pro-solid-svg-icons/faArrowFromBottom'
export default class FASArrowFromBottom extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faArrowFromBottom} />)
  }
}
