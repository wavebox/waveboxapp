import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt'
export default class FARSignOut extends React.Component {
  render () {
    return (<FontAwesomeIcon {...this.props} icon={faSignOutAlt} />)
  }
}
