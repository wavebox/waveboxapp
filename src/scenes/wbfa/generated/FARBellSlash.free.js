import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBellSlash } from '@fortawesome/free-regular-svg-icons/faBellSlash'
export default class FARBellSlash extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faBellSlash} />)
  }
}
