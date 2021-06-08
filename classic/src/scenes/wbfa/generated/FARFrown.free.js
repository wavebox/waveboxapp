import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFrown } from '@fortawesome/free-regular-svg-icons/faFrown'
export default class FARFrown extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faFrown} />)
  }
}
