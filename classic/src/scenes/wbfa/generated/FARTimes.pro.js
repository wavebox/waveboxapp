import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/pro-regular-svg-icons/faTimes'
export default class FARTimes extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faTimes} />)
  }
}
