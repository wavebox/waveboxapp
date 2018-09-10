import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-regular-svg-icons/faBell'
export default class FARBell extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faBell} />)
  }
}
