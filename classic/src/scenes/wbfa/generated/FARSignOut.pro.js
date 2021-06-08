import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOut } from '@fortawesome/pro-regular-svg-icons/faSignOut'
export default class FARSignOut extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSignOut} />)
  }
}
